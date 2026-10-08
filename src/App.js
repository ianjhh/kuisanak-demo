import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Quiz from './Quiz';
import QuizList from './QuizList';
import AboutUs from './AboutUs';
import FactList from './FactList';
import FactArticle from './FactArticle';
import { FACT_CATEGORIES } from './factCategories';
import Sitemap from './Sitemap';

// Every page of the app. index.js wraps these in a HashRouter, which keeps
// working when the build is served from a sub-folder of another site.
function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      {/* The demo has no accounts: sign-up and email verification lead to the name form. */}
      <Route path='/register' element={<Navigate to='/login' replace />} />
      <Route path='/login' element={<Login />} />
      <Route path='/verify' element={<Navigate to='/login' replace />} />
      <Route path='/quiz' element={<QuizList />} />
      <Route path='/about-us' element={<AboutUs />} />
      <Route path='/sitemap' element={<Sitemap />} />
      {/* keys make React start fresh when switching between categories */}
      {FACT_CATEGORIES.map((category) => [
        <Route key={category.key} path={category.path} element={<FactList key={category.key} category={category} />} />,
        <Route key={`${category.key}-article`} path={`${category.path}/:fact-title`} element={<FactArticle key={category.key} category={category} />} />,
      ])}
      <Route path='/quiz/:quiz-name' element={<Quiz />} />
    </Routes>
  );
}

export default App;
