import { Link } from 'react-router-dom';
import './Game.css';

function CybersecurityGame() {
    return (
        <main className="cyber-game">
            <Link className="game-exit" to="/">← 退出遊戲</Link>
        </main>
    );
}

export default CybersecurityGame;
