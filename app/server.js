const express = require('express');
const open = require('open');
const path = require('path');

const app = express();
const port = 3030;

app.use(express.static(path.join(__dirname, 'out')));

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
    open(`http://localhost:${port}`);
});
