const Leaderboard = (topScores) => (
    `<h3>Top Scores:</h3>
    <hr>
    <section>
        <ol>
            ${ListItems(topScores)}
        </ol>
    </section>`
);

export default Leaderboard;

//sort top scores from lowest to highest average time between clicks
const ListItems = (topScores) => {
    let li = ``;
    const scores = topScores.sort((a,b) => a.timeClicks - b.timeClicks);
    for(let row of scores){
        li += `<li>${row.name}: ${row.timeClicks}ms, ${row.accuracy}%</li>`
    }
    return li;
}