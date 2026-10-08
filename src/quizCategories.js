import { useEffect, useState } from 'react';
import axios from 'axios';

// The quiz categories, in the order the quiz list and sitemap show them.
export const QUIZ_CATEGORIES = [
    { key: 'animal', title: 'Animal Quizzes', endpoint: '/api/fetchAnimalQuiz' },
    { key: 'math', title: 'Math Quizzes', endpoint: '/api/fetchMathQuiz' },
    { key: 'language', title: 'Language Quizzes', endpoint: '/api/fetchLanguageQuiz' },
    { key: 'miscellaneous', title: 'More Quizzes', endpoint: '/api/fetchMiscellaneousQuiz' },
];

// Loads every category's quizzes, keyed by category: { animal: [...], ... }.
export function useQuizCategories() {
    const [quizzes, setQuizzes] = useState({});

    useEffect(() => {
        let active = true;
        QUIZ_CATEGORIES.forEach((category) => {
            axios.get(category.endpoint)
            .then(function (response) {
                if (active) {
                    setQuizzes((loaded) => ({ ...loaded, [category.key]: response.data }));
                }
            })
            .catch(function (error) {
                console.log(error.response ? error.response.status : error);
            });
        });
        return () => {
            active = false;
        };
    }, []);

    return quizzes;
}
