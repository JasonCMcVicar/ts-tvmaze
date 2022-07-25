import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodeList = $('#episodesList');
const $searchForm = $("#searchForm");
const BASE_URL = "https://api.tvmaze.com";
const NO_IMG_URL = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term): Promise<Array<Object>> {
  const response = await axios.get(`${BASE_URL}/search/shows`,
    { params: { "q": term } });
  return response.data.map(showAndScore => {
    const show = showAndScore.show;
    let image = show.image !== null ? show.image.medium : NO_IMG_URL;
    return {
      "id": show.id,
      "name": show.name,
      "summary": show.summary,
      "image": image
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Array<Object>) {
  $showsList.empty();

  for (let show of shows) {
    console.log("show is ", show);
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number) {
  const response = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  return response.data.map(episode: Record => {
    return {
      "id": episode.id,
      "name": episode.name,
      "season": episode.season,
      "number": episode.number
    };
  });
}

/** Takes an array of episodes and adds them to episode area
 * in and unordered lists */

function populateEpisodes(episodes: Array<Record<string, number>>) {
  $episodeList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id=${episode.id}>
        ${episode.name} (season ${episode.season}, episode ${episode.number})
      </li>`
    );
    $episodeList.append($episode);
  }
}

/**uses get episode function and populate episode function
 * to get a show ID and display the episode on the bottom of the page
 */
 async function searchForEpisodesAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);
  $episodesArea.show();
  populateEpisodes(episodes);
}

/** adds on to all episode buttons in show area, grabs show id from
 * target show and executes searchForEpisodesAndDisplay func */

$showsList.on('click', '.Show-getEpisodes', async function (evt) {
  const showID = $(evt.target).closest('.Show').attr('data-show-id');
  await searchForEpisodesAndDisplay(Number(showID));
});



// return [
//   {
//     id: 1767,
//     name: "The Bletchley Circle",
//     summary:
//       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
//          women with extraordinary skills that helped to end World War II.</p>
//        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
//          normal lives, modestly setting aside the part they played in
//          producing crucial intelligence, which helped the Allies to victory
//          and shortened the war. When Susan discovers a hidden code behind an
//          unsolved murder she is met by skepticism from the police. She
//          quickly realises she can only begin to crack the murders and bring
//          the culprit to justice with her former friends.</p>`,
//     image:
//         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
//   }
// ]
