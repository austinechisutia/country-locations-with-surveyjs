// components/Survey.tsx
'use client'

import { useEffect, useState, useRef, useMemo } from 'react';
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

    // Initialize survey model once
    const survey = useMemo(() => {
        const model = new Model(surveyJson);
        model.applyTheme(DefaultLight);
        return model;
    }, []);

    useEffect(() => {
        setIsClient(true);

        // Configure survey event handlers
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
                        sender.setValue("phoneNumber", country.dial + " ");
                    }

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
                sender.setValue("city", undefined);
            }
        });

        // Detect country from IP
        const detectCountry = async () => {
            try {
                console.log('[Survey] Fetching country from /api/detect-country...');
                const response = await fetch('/api/detect-country');
                if (!response.ok) {
                    console.error('[Survey] API error:', response.status);
                    return;
                }

                const data = await response.json();
                console.log('[Survey] API response:', data);

                if ((data.status === 'success' || data.status === 'fallback') && data.country_code) {
                    const country = countries.find(c => c.code === data.country_code);
                    if (country) {
                        console.log(`[Survey] Setting ${data.status} country:`, country.name);
                        survey.setValue("country", country.code);
                    }
                } else if (data.status === 'error') {
                    console.warn('[Survey] Detection error:', data.error);
                }
            } catch (error) {
                console.error('[Survey] Detection fetch failed:', error);
            }
        };

        detectCountry();

        // Cleanup function to avoid duplicate listeners on re-mount if needed
        return () => {
            survey.onValueChanged.clear();
        };
    }, [survey]);

    if (!isClient) {
        return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Initialising survey engine...
        </div>;
    }

    return <Survey model={survey} />;
}


