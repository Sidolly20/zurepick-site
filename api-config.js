// Where the website gets live data. If the API is unreachable the site shows the saved data/*.json snapshots.
// 1) Hosted API (Render):
window.ZUREPICKS_API_BASE = '';
// 2) Your own local API: run the backend on your PC (npm start, port 10000), then open the site once with
//    ?api=http://localhost:10000   (use ?api=reset to go back to the hosted address).
