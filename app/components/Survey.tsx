// components/Survey.tsx
'use client'

import 'survey-core/survey-core.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { DefaultLight } from 'survey-core/themes';
import { countries } from '../constants/countries';

const surveyJson = {
    showQuestionNumbers: "off",
    elements: [
        {
            type: "panel",
            name: "locationSection",
            title: "Location Details",
            elements: [
                {
                    type: "dropdown",
                    name: "countryCode",
                    title: "Country",
                    isRequired: true,
                    width: "50%",
                    choices: countries
                },
                {
                    type: "text",
                    name: "phoneNumber",
                    title: "Phone Number",
                    startWithNewLine: false,
                    isRequired: true,
                    width: "50%"
                },
                {
                    type: "text",
                    name: "city",
                    title: "City",
                    isRequired: true,
                    width: "50%"
                },
                {
                    type: "text",
                    name: "state",
                    title: "State/Province",
                    startWithNewLine: false,
                    isRequired: true,
                    width: "50%"
                }
            ]
        }
    ]
};

export default function SurveyComponent() {
    const survey = new Model(surveyJson);
    survey.applyTheme(DefaultLight);

    return <Survey model={survey} />;
}
