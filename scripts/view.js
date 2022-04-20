import Leaderboard from './components/Leaderboard.js';
import LeaderMenu from './components/LeaderMenu.js';

const renderDOM = (html) => document.getElementById('view').innerHTML = html; //Set HTML in view

export const GameoverScene = (props) => {
    const {timeClicks, accuracy, topScores} = props;
    renderDOM(
        `${isTop5(timeClicks, accuracy, topScores) ? LeaderMenu() : ''}
        <h1>Game Over!</h1>
        <button onclick="window.location.reload()">Refresh Page</button>
        <br>
        <br>`
    )
}

export const StartMenu = (props) => {
    const{topScores} = props;
    renderDOM(
        `${Leaderboard(topScores)}
        <hr>
        <button onclick="window.location.reload()">Refresh Page</button>
        <br>
        <br>`
    )
}

const isTop5 = (timeClicks, accuracy, top5) => top5.some(item => item.timeClicks > timeClicks) && accuracy > 86;