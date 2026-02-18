// components/Survey.tsx
'use client'

import { useEffect, useState, useRef } from 'react';
import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { DefaultLight } from 'survey-core/themes';
import { countries, getFlagEmoji } from '../constants/countries';

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
                    type: "text",
                    name: "flagEmoji",
                    title: "Flag Emoji",
                    readOnly: true,
                    width: "33%",
                    startWithNewLine: false
                },
                {
                    type: "text",
                    name: "city",
                    title: "City",
                    width: "50%",
                    startWithNewLine: true
                },
                {
                    type: "text",
                    name: "state",
                    title: "State/Province",
                    width: "50%",
                    startWithNewLine: false
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

        // When Country changes: prefill dial code in phone number + update flag emoji
        survey.onValueChanged.add((sender: any, options: any) => {
            if (options.name === "country" && options.value) {
                const country = countries.find(c => c.code === options.value);
                if (country) {
                    sender.setValue("countryCode", country.code);
                    sender.setValue("flagEmoji", country.emoji);
                    // Prefill phone number with dial code
                    sender.setValue("phoneNumber", country.dial + " ");
                }
            } else if (options.name === "country" && !options.value) {
                sender.setValue("countryCode", undefined);
                sender.setValue("flagEmoji", undefined);
                sender.setValue("phoneNumber", undefined);
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
