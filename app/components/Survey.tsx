// components/Survey.tsx
'use client'

import { useEffect, useState, useRef } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { DefaultLight } from 'survey-core/themes';
import { countries } from '../constants/countries';
import { State, City } from 'country-state-city';

const surveyJson = {
    showQuestionNumbers: "off",
    elements: [
        {
            type: "panel",
            name: "locationDetails",
            title: "Location Details",
            elements: [
                {
                    type: "dropdown",
                    name: "country",
                    title: "Country",
                    choices: countries.map(c => ({ value: c.code, text: `${c.name} ${c.emoji}` })),
                    width: "34%",
                    startWithNewLine: true,
                    searchEnabled: true,
                    autocomplete: "on",
                    allowClear: true
                },
                {
                    type: "text",
                    name: "phoneNumber",
                    title: "Phone Number",
                    inputType: "tel",
                    width: "33%",
                    startWithNewLine: false
                },
                {
                    type: "dropdown",
                    name: "state",
                    title: "State/Province",
                    width: "50%",
                    startWithNewLine: true,
                    searchEnabled: true,
                    allowClear: true,
                    placeholder: "Select a country first..."
                },
                {
                    type: "dropdown",
                    name: "city",
                    title: "City",
                    width: "50%",
                    startWithNewLine: false,
                    searchEnabled: true,
                    allowClear: true,
                    placeholder: "Select a state first..."
                }
            ]
        }
    ]
};

export default function SurveyComponent() {
    const [isClient, setIsClient] = useState(false);
    const surveyRef = useRef<Model | null>(null);

    // Only render on client to avoid hydration mismatch and "swiping away" errors
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!surveyRef.current && typeof window !== 'undefined') {
        const survey = new Model(surveyJson);
        survey.applyTheme(DefaultLight);

        // When Country changes: prefill dial code in phone number + update flag emoji + load states
        survey.onValueChanged.add((sender: any, options: any) => {
            if (options.name === "country") {
                const countryCode = options.value;
                const stateQuestion = sender.getQuestionByName("state");
                const cityQuestion = sender.getQuestionByName("city");

                if (countryCode) {
                    const country = countries.find(c => c.code === countryCode);
                    if (country) {
                        sender.setValue("countryCode", country.code);
                        sender.setValue("flagEmoji", country.emoji);
                        // Prefill phone number with dial code
                        sender.setValue("phoneNumber", country.dial + " ");
                    }

                    // Update states
                    const states = State.getStatesOfCountry(countryCode).map(s => ({
                        value: s.isoCode,
                        text: s.name
                    }));
                    stateQuestion.choices = states;
                    stateQuestion.placeholder = "Select a state...";
                } else {
                    sender.setValue("countryCode", undefined);
                    sender.setValue("flagEmoji", undefined);
                    sender.setValue("phoneNumber", undefined);
                    stateQuestion.choices = [];
                    stateQuestion.placeholder = "Select a country first...";
                }

                // Reset child selections
                sender.setValue("state", undefined);
                sender.setValue("city", undefined);
                cityQuestion.choices = [];
                cityQuestion.placeholder = "Select a state first...";

            } else if (options.name === "state") {
                const stateCode = options.value;
                const countryCode = sender.getValue("country");
                const cityQuestion = sender.getQuestionByName("city");

                if (stateCode && countryCode) {
                    const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({
                        value: c.name,
                        text: c.name
                    }));
                    cityQuestion.choices = cities;
                    cityQuestion.placeholder = "Select a city...";
                } else {
                    cityQuestion.choices = [];
                    cityQuestion.placeholder = "Select a state first...";
                }
                // Reset city selection
                sender.setValue("city", undefined);
            }
        });

        surveyRef.current = survey;

        // Auto-detect country from IP address on mount
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) return;
                const data = await response.json();
                const countryCode = data.country_code;

                if (countryCode && surveyRef.current) {
                    const country = countries.find(c => c.code === countryCode);
                    if (country) {
                        surveyRef.current.setValue("country", country.code);
                    }
                }
            } catch (error) {
                console.warn('Could not detect country from IP:', error);
            }
        };

        detectCountry();
    }

    if (!isClient) {
        return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Initialising survey engine...
        </div>;
    }

    return <Survey model={surveyRef.current!} />;
}

