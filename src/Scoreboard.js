import { Link } from 'react-router-dom';
import { useQuizCategories } from './quizCategories';
import { imageFor } from './images';
import './Scoreboard.css';

// An attempt asks at most this many questions (Quiz.js), so older history
// entries without a total are counted out of 10.
const DEFAULT_TOTAL = 10;

// The signed-in player's scores: who they are, three totals, and their recent quizzes.
// `history` is oldest first, as the API returns it: [[quizName, score, total?], ...].
function Scoreboard({ name, history }) {
    const quizzes = useQuizCategories();
    const byName = {};
    Object.values(quizzes).flat().forEach((quiz) => { byName[quiz.name] = quiz; });

    const attempts = (history || []).map(([quiz, score, total]) => ({
        quiz,
        score,
        total: total || DEFAULT_TOTAL,
        title: byName[quiz] ? byName[quiz].title : quiz,
        image: byName[quiz] ? byName[quiz].quizImage : null,
    })).reverse();

    const percent = (a) => (a.total ? Math.round((100 * a.score) / a.total) : 0);
    const average = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + percent(a), 0) / attempts.length) : 0;
    const best = attempts.reduce((top, a) => (!top || percent(a) > percent(top) ? a : top), null);

    return (
        <div className="scoreboard">
            <div className="scoreboard-header">
                <div className="scoreboard-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
                <div>
                    <div className="scoreboard-label">Papan Skor</div>
                    <h3 className="scoreboard-name">{name}</h3>
                </div>
            </div>

            <div className="scoreboard-stats">
                <div className="scoreboard-stat">
                    <span className="scoreboard-stat-value">{attempts.length}</span>
                    <span className="scoreboard-stat-label">Kuis</span>
                </div>
                <div className="scoreboard-stat">
                    <span className="scoreboard-stat-value">{attempts.length ? `${average}%` : '-'}</span>
                    <span className="scoreboard-stat-label">Rata-rata</span>
                </div>
                <div className="scoreboard-stat">
                    <span className="scoreboard-stat-value">{best ? `${best.score}/${best.total}` : '-'}</span>
                    <span className="scoreboard-stat-label">Terbaik</span>
                </div>
            </div>

            <div className="scoreboard-section">Aktivitas Terbaru</div>
            {attempts.length === 0 ? (
                <div className="scoreboard-empty">
                    <div className="scoreboard-empty-icon" aria-hidden="true">🏆</div>
                    <p>Belum ada kuis. Ayo mulai dan kumpulkan skor!</p>
                    <Link to="/quiz" className="scoreboard-start">Pilih kuis</Link>
                </div>
            ) : (
                <ul className="scoreboard-list">
                    {attempts.map((a, idx) => (
                        <li key={idx} className="scoreboard-item">
                            {a.image
                                ? <img src={imageFor(a.image)} alt="" className="scoreboard-thumb" />
                                : <div className="scoreboard-thumb" aria-hidden="true" />}
                            <div className="scoreboard-item-body">
                                <div className="scoreboard-item-top">
                                    <Link to={`/quiz/${a.quiz}`} className="scoreboard-item-title">{a.title}</Link>
                                    <span className={`scoreboard-score ${level(percent(a))}`}>
                                        {percent(a) === 100 && <span aria-hidden="true">⭐ </span>}
                                        {a.score}/{a.total}
                                    </span>
                                </div>
                                <div className="scoreboard-bar" aria-hidden="true">
                                    <div className={`scoreboard-bar-fill ${level(percent(a))}`} style={{ width: `${percent(a)}%` }} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Colour by how well the quiz went.
function level(percent) {
    if (percent >= 80) return 'is-great';
    if (percent >= 50) return 'is-good';
    return 'is-low';
}

export default Scoreboard;
