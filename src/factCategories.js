// The three fact sections. Each has a list page and an article page that
// share the FactList and FactArticle components.
export const FACT_CATEGORIES = [
    {
        key: 'binatang',
        path: '/animal-facts',
        title: 'Animal Facts',
        listEndpoint: '/api/fetchAnimalFacts',
        articleEndpoint: '/api/fetchAnimalFact',
    },
    {
        key: 'angkasa',
        path: '/space-facts',
        title: 'Space Facts',
        listEndpoint: '/api/fetchSpaceFacts',
        articleEndpoint: '/api/fetchSpaceFact',
    },
    {
        key: 'aneh',
        path: '/weird-facts',
        title: 'Weird but True Facts',
        listEndpoint: '/api/fetchRandomFacts',
        articleEndpoint: '/api/fetchRandomFact',
    },
];
