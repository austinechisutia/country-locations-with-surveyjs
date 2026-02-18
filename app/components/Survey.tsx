// components/Survey.tsx
'use client'

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
                    choices: countries.map(c => ({ value: c.code, text: `${c.emoji} ${c.name}` })),
                    width: "34%",
                    startWithNewLine: true
                },
                {
                    type: "text",
                    name: "countryCode",
                    title: "ISO Code",
                    readOnly: true,
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
    const survey = new Model(surveyJson);
    survey.applyTheme(DefaultLight);

    // Sync ISO Code and Flag Emoji when Country changes
    survey.onValueChanged.add((sender: any, options: any) => {
        if (options.name === "country" && options.value) {
            const country = countries.find(c => c.code === options.value);
            if (country) {
                sender.setValue("countryCode", country.code);
                sender.setValue("flagEmoji", country.emoji);
            }
        } else if (options.name === "country" && !options.value) {
            sender.setValue("countryCode", undefined);
            sender.setValue("flagEmoji", undefined);
        }
    });

    return <Survey model={survey} />;
}
