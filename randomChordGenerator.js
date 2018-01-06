//TO DO:
// Need to make predictable subsets:
//      All qualities with just one root (could just a list of all qualities and just do whatever root you choose).
//      Forms (i.e. generate an A section, B section, etc., then assemble them into a form, like AABA, with different lengths of phrases and endings).
// "Pause," or make big group and divide it into parts that can be retrieved. Maybe make a copy-and-pastable form of
//      encoding?
// Maybe use objects to conveniently store some persistent information in place of current global vars.

////////////////////////////
//GLOBAL VARS & INITIALIZATION
//All global vars are used *ONLY* by the mainLoop (NOTE: this may no longer be true). If I can get them passed to mainLoop,
//      then it won't mess anything up to make them no longer global.
//I'd like to pass all the global vars used by mainLoop to mainLoop as arguments
//      (so that they're private), but the only place from where I know how to do that is in the
//      setInterval command in the "frameRate" global var, but that doesn't seem to work.
//      P.S. The "frameRate" var implementation of setInterval(mainLoop, bpm) is "necessary" (afaik)
//          because clearInterval is the only way I know how to stop a setInterval, and only via the
//          particular implementation I used here, which I read about pretty much verbatim.

var METRONOMIC_INTERVALS = "display the list's items at metronomic intervals";
var LIST_WITH_SPACES = 'display the list with spaces between the items';
var BUTTON_PRESS_INCREMENTS_LIST = 'pressing the space bar displays the next item in the list'; // needs HTML
var BUTTON_PRESS_RANDOM_ITEMS = 'pressing the space bar displays a random item from the list'; // needs HTML
var SPACE_BAR = 32;

var frameRate,
    mode = BUTTON_PRESS_RANDOM_ITEMS,
    frameCounter = 1,
    subdivisionsPerMeasure = 2,
    measuresPerChord = 2,
    blankLines = subdivisionsPerMeasure * measuresPerChord - 1,
    bpm = 37,
    chordCounter = 1,
    itemsToDisplayPerButtonPress = 4,
    noKeyPressUntil = Date.now(),
    randomizedChordsList,
    incrementalIndex = 0, // used for BUTTON_PRESS_INCREMENT_LIST mode. Should probably be an object property instead of a global var.
    currentList;
    

//randomizedChordsList = makeRandomizedChordsList(['mm', 'hmin', /*'church',*/  'hMaj', 'oct', '7sus4', /*'whol',*/ 'Maj7sus2', '7sus2'/*, 'hex'*/]);    //valid entries are: 'mm', 'hmin', 'hMaj', 'church', '7sus4', 'oct', 'hex', 'whol', 'Maj7sus2', '7sus2'
//randomizedChordsList = makeRandomizedChordsList(['mm', 'hmin', 'hMaj', 'oct']);
randomizedChordsList = makeRandomizedChordsList(['mm', 'hmin', 'hMaj', 'oct', 'church']);
currentList = randomizedChordsList;

// these three lines below here were just to make sure that the randomizing process wasn't changing the lenght of the array, which happened in another program I made that used similar code and had that problem
//chordsList = makeChordsList(['church', 'hmin', 'mm', 'hMaj']);
//randomizedChordsList = makeRandomizedChordsList(['church', 'hmin', 'mm', 'hMaj']);                            
//console.log(chordsList.length + ' ' + randomizedChordsList.length);

//could add 6 chord qualities, but would have to figure out how to break down their possibilities. One possibility is using all the 7th chords that have a natural 6th in them, but there might be a few others that are possible.


// MODES BEHAVIORS

if (mode === METRONOMIC_INTERVALS) frameRate = setInterval(mainLoop, bpmToMs(bpm));

if (mode === LIST_WITH_SPACES) displayListWithBlankLinesBetweenItems(randomizedChordsList, blankLines);

// ONLY WORKS IN BROWSER
if (mode === BUTTON_PRESS_INCREMENTS_LIST || mode === BUTTON_PRESS_RANDOM_ITEMS) {
    var validInputs = [SPACE_BAR];
    if (noKeyPressUntil <= Date.now()) {
        $('body').on('keydown', function (event) {
            var listToDisplay = [];
            if (validInputs.indexOf(event.which) === -1) console.log('Invalid input!');
            else {
                if (event.which == SPACE_BAR && mode === BUTTON_PRESS_INCREMENTS_LIST) {
                    if (!currentList) console.log('Empty or invalid list!');
                    else for (var i = 0; i < itemsToDisplayPerButtonPress; i++) {
                        listToDisplay.push(currentList[incrementalIndex + i]);
                    }
                    incrementalIndex += itemsToDisplayPerButtonPress;
                }
                if (event.which == SPACE_BAR && mode === BUTTON_PRESS_RANDOM_ITEMS) {
                    if (!currentList) console.log('Empty or invalid list!');
                    else for (var j = 0; j < itemsToDisplayPerButtonPress; j++) {
                        var randomIndex = Math.round(Math.random() * (currentList.length - 1));
                        listToDisplay.push(currentList[randomIndex]);
                    }
                }
                displayListWithBlankLinesBetweenItems(listToDisplay, blankLines);
                noKeyPressUntil = Date.now() + 200; // just making sure the key press doesn't trigger multiple events
            }
        });
    }
}

// END MODES BEHAVIOR

function bpmToMs(bpm) {
    var msBetweenBeats;
    msBetweenBeats = 60000 / bpm;
    return msBetweenBeats;
}

//////////////////////////////

function makeRandomizedChordsList(arrayOfScaleQualities) {  //    //Valid scale qualities to pass to this function (see the "scaleQualityIntoChordQualities" function for details or corrections): 'mm', 'hmin', 'hMaj', 'church', 'oct', '7sus4', 'hex', 'whol'
    //this function turns scale qualities passed to it as arguments (i.e. church, harmonic minor) into all the chords
    //      associated with all their modes in all 12 keys. So one 7-note scale quality (i.e. harmonic Major) will generate 84 (12 x 7) chords.
    var allQualities = scaleQualityIntoChordQualities(arrayOfScaleQualities), //turns scale qualities passed to the "makeRandomizedChordsList" function as arguments into one big array holding all of the chord qualities associated with the passed scale qualities.
    allChords = addRootsToChordQualities(allQualities),    //attaches the chord qualities from the array generated by the line above to all the roots. So after this line, you end up with an array holding 12x the number of items the "allQualities" var (array) had in it before this line was executed (i.e. however many qualities x 12 roots).
    randomOrderedListOfChords = randomizeOrderOfArrayItems(allChords);  //randomizes the order of the chords in the allChords array.
    return randomOrderedListOfChords;   //returns array of all chords (chord qualities x 12 keys) associated with the scale qualities passed to this function
}

// NOTE: THIS FUNCTION WAS ONLY USED for testing to make sure the randomizing process wasn't changing the array length, which happened to me in another project using similar code.
function makeChordsList(arrayOfScaleQualities) {
    //this function turns scale qualities passed to it as arguments (i.e. church, harmonic minor) into all the chords
    //      associated with all their modes in all 12 keys. So one 7-note scale quality (i.e. harmonic Major) will generate 84 (12 x 7) chords.
    var allQualities = scaleQualityIntoChordQualities(arrayOfScaleQualities), //turns scale qualities passed to the "makeRandomizedChordsList" function as arguments into one big array holding all of the chord qualities associated with the passed scale qualities.
    allChords = addRootsToChordQualities(allQualities);    //attaches the chord qualities from the array generated by the line above to all the roots. So after this line, you end up with an array holding 12x the number of items the "allQualities" var (array) had in it before this line was executed (i.e. however many qualities x 12 roots).
    return allChords;   //returns array of all chords (chord qualities x 12 keys) associated with the scale qualities passed to this function   
}

function scaleQualityIntoChordQualities(arrayOfScaleQualities) {
    //this function takes any scale qualities (i.e. church, melodic minor) passed to it and calls functions
    //      that "unpack" the scale into an array of all the chord qualities (/modes) that can be derived from it.
    //      It returns an array containing all the chord qualities associated with all the scale qualities passed to it.
    //Valid scale qualities (arguments for this function) are: 'mm', 'hmin', 'hMaj', 'church', 'oct', '7sus4', 'hex', 'whol', 'Maj7sus2', '7sus2'
    var allQualities = [];
    for (var i = 0; i < arrayOfScaleQualities.length; i++) {
        if (arrayOfScaleQualities[i] === 'mm') {    //if 'mm' is an item in the array passed to this function as an argument...
            allQualities = allQualities.concat(makeMMModesChordQualitiesList());    //then all the chord qualities associated with the melodic minor mode will be added to the "allQualities" var (array)
        }
        if (arrayOfScaleQualities[i] === 'hmin') {  //etc.
            allQualities = allQualities.concat(makeHMinModesChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === 'hMaj') {
            allQualities = allQualities.concat(makeHMajModesChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === 'church') {
            allQualities = allQualities.concat(makeChurchModesChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === 'oct') {
            allQualities = allQualities.concat(makeOctatonicModesChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === '7sus4') {
            allQualities = allQualities.concat(make7sus4ChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === 'hex') {
            allQualities = allQualities.concat(makeHexatonicModesChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === 'whol') {
            allQualities = allQualities.concat(makeWholetoneModesChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === 'Maj7sus2') {
            allQualities = allQualities.concat(makeMaj7sus2ChordQualitiesList());
        }
        if (arrayOfScaleQualities[i] === '7sus2') {
            allQualities = allQualities.concat(make7sus2ChordQualitiesList());
        }
        //MAYBE ADD:
        //Maj7sus4
        //6 and min 6 variations
    }
    return allQualities;    //all the chord qualities, in one big array, associated with the scale qualities passed to this function will be returned.
}

function makeChurchModesChordQualitiesList() {
    return ['Maj7 (ionian, church1)', 'min7 (dorian, church2)', 'min7 phrygian (b9 b13, church3)', 'Maj7 #11 (lydian, church4)', '7 (mixolydian, church5)', 'min7 aeolian (church6)', 'min7 b5 locrian (church7)'];
}

function makeHMinModesChordQualitiesList() {
    return ['minMaj7 b13 (hmin1)', 'min7 b5 b9 (hmin2)', 'Maj7 #5 nat11 (hmin3)', 'min7 #11 (hmin4)', '7 b9 b13 (hmin5)', 'Maj7 #9 (hmin6)', '6 alt (hmin7)'];    
}

function makeHMajModesChordQualitiesList() {
    return ['Maj7 b13 (hMaj1)', 'min7 b5 (hMaj2)', '7 b9 #9 b13 (hMaj3)', 'minMaj7 #11 (hMaj4)', '7 b9 (hMaj5)', 'Maj7 #5 #9 (hMaj6)', 'min6 b5 #5 b9 (hMaj7)'];    
}

function makeMMModesChordQualitiesList() {
    return ['minMaj7 (mm1)', 'min7 b9 (mm2)', 'Maj7 #5 (mm3)', '7 #11 (mm4)', '7 b13 (mm5)', 'min7 b5 b13 (mm6)', '7 alt (mm7)'];    
}

function makeOctatonicModesChordQualitiesList() {
    return ['dim (oct)', '7 b9 #9 (oct)'];
}

function make7sus4ChordQualitiesList() {
    return ['7sus4', '7sus4 b9', '7sus4 b13', '7sus4 b9 b13', '7sus4 b5', '7sus4 b5 b9', '7sus4 b5 b13', '7sus4 b5 b9 b13'];    //maybe I should make normal chords with "no 3" modifiers?   
}

function makeHexatonicModesChordQualitiesList() {
    return ['Maj7 #9 b13 (hex)', '6 b9 #5 nat11 (hex)'];   
}

function makeWholetoneModesChordQualitiesList() {
    return ['7 #5 (wholetone)'];
}

function makeMaj7sus2ChordQualitiesList() {
    return ['Maj7sus2 #11'];
}

function make7sus2ChordQualitiesList() {
    return ['7sus2 #11'];
}

//for 6 chords should I look all the 7 qualities with a natural 6 and include them as 6 chords? That might not get all possibilities...

function makeRootsList() {
    return ['C/B#', 'Db/C#', 'D', 'Eb/D#', 'Fb/E', 'F/E#', 'Gb/F#', 'G', 'Ab/G#', 'A', 'Bb/A#', 'Cb/B'];
}

function addRootsToChordQualities(chordQualitiesList) {
    //this takes a list of chord qualities and pairs them each with all twelve roots.
    //If you just pass it ['min7'], for instance, it will return 'min7' in all twelve keys.
    var allChordQualities = chordQualitiesList,
        allRoots = makeRootsList(),
        allChords = [];
    for (var i = 0; i < allRoots.length; i++) {
        for (var j = 0; j < allChordQualities.length; j++) {
            allChords.push(allRoots[i] + ' ' + allChordQualities[j]);
        }
    }
    return allChords;
}

function randomizeOrderOfArrayItems(array) {
    //Does what it says: pass it an array, and it will scramble the items' ordering.
    var allScales = array,
        numberOfScales = allScales.length;
        randomOrderedListOfScales = [];
    for (var i = 0; i < numberOfScales; i++) {
        var newScaleIndex = Math.round(Math.random() * (allScales.length - 1));
        randomOrderedListOfScales.push(allScales[newScaleIndex]);
        allScales.splice(newScaleIndex, 1);
    }
    return randomOrderedListOfScales;
}

/////////////////////////////////////////////////

// Metronomic reading out of chord list version of main loop
// NOTE: This loop is called from the "frameRate" global var, which might be temporarily commented out in order to display the chord list differently.
function mainLoop() {
    //this will read out items of an array at regular intervals, stopping when the list has been displayed completely.
    //X's will show up at the beginning of every measure that doesn't start with a new chord,
    //      and "-"s will show up every beat that contains neither a new chord nor the beginning of a measure.
    if ((frameCounter - 1) % (subdivisionsPerMeasure * measuresPerChord) === 0) {
        console.log(randomizedChordsList[chordCounter - 1] + ' ' + chordCounter);
        chordCounter++;
    }
    if ((frameCounter - 1) % (subdivisionsPerMeasure * measuresPerChord) !== 0 && (frameCounter - 1) % subdivisionsPerMeasure === 0) {
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    }
    if ((frameCounter - 1) % (subdivisionsPerMeasure * measuresPerChord) !== 0 && (frameCounter - 1) % subdivisionsPerMeasure !== 0) {
        console.log('--------------------------------');
    }
    if (chordCounter > randomizedChordsList.length) {
        //this limits how long the program will run
        clearInterval(frameRate);
    }
    frameCounter++;
}

function displayListWithBlankLinesBetweenItems(list, numberOfBlankLinesBetweenItems) {
    var spacedList = [],
        lines = numberOfBlankLinesBetweenItems;
    for (var i = 0; i < list.length; i++) {
        spacedList.push(list[i]);
        for (var j = 0; j < lines; j++) {
            spacedList.push('                                                ');
        }
    }
    console.log(spacedList);
}

////////////////////////////////////////////
//NOTES/IDEAS FOR MORE FUNCTIONALITIES:

//ADD "PAUSE" BUTTON!!!

//RANDOM FORM GENERATOR IDEAS
//I'd like to put together a random tune/song form generator.
//  In it you could set a fixed form for when chords change.
//      I.e. an array of chord lengths (i.e. blues is [1, 1, 2, 2, 2, 1, 1, 2])
//      You could include repeats, i.e. randomly generate chords for an A section and a B section,
//          then generate an AABA form. (It would be good to accomodate different endings
//          as well, i.e. "A, A 2nd ending, B, A third ending" with ending lengths being a
//          definable variable with ranges (i.e. endings for sections that occur multiple times
//          in a form could range in length from 2 beats to 3 bars).
//      You could generate random chord lengths that didn't violate phrase boundaries,
//          i.e. "random chord 2 beats to 4 bars in length, but always a chord change
//          at the beginning of every 4 or 8 bars.
//      The form could be presented scrolling in realtime or as a lead sheet.



////////////////////////////////////////////