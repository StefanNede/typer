import {useState, useEffect} from "react"

const getLetters = (text) => {
    let letters = []
    for (let letter of text) {
            letters.push(letter)
    }
    return letters
}

const getElements = (letters) => {
    let lettersEls = []
    for (let letter of letters) {
        if (letter === " ") {
            lettersEls.push(<div className="w-1 opacity-50 text-lg" style={{width:"0.25rem"}}>{letter}</div>)
        } else {
            lettersEls.push(<div className="text-white opacity-50 text-lg">{letter}</div>)
        }
    }
    return lettersEls
}

const getPreviousLengths = (words, index) => {
    let s = 0
    for (let i = 0; i<index;i++) {
        s += words[i].length
        s++ // for the space separating the words
    }
    return s
}

export default function OnlineTest({ text, socket, username, roomName, startTime, usersFinished, setUsersFinished }) {
    let words = text.split(" ")
    let letters = getLetters(text)
    const [lettersEls, setLettersEls] = useState([])
    
    const [index, setIndex] = useState(0) // holds the index of the word the person is on
    const [letterIndex, setLetterIndex] = useState(0) // holds the index of the letter the person is on

    const [char, setChar] = useState(0)
    const [correctChars, setCorrectChars] = useState(0)
    const [wpm, setWPM] = useState(0)
    const [accuracy, setAccuracy] = useState(0)

    const [timeTaken, setTimeTaken] = useState(0)
    const averageCharactersPerWord = 5

    useEffect(() => {
        words = text.split(" ")
        letters = getLetters(text)
        setLettersEls(getElements(letters))
    }, [text])

    function checkDeleted(event) {
        // only on key up will the resulting text after the deletion be present
        if (event.key === "Backspace" || event.key === "Delete") {
            // check what is currently in the input box because they could've done ctrl+backspace which deletes everything
            let wordTyped = event.target.value.trim() // this is the word left over after the backspace
            const previousLengths = getPreviousLengths(words, index)
            // add wordTyped.length to previousLengths to place letterIndex however much through the word the user is
            setLetterIndex(previousLengths + wordTyped.length)

            // change the displayed letters (green or red or white letters) to updated version
            for (let li = previousLengths+wordTyped.length; li < previousLengths + words[index].length; li++) {
                if (letters[li] !== " ") { 
                    lettersEls[li] = <div key={li} className="text-white text-lg opacity-50">{letters[li]}</div>
                }
            }
        }
    }

    function checkCorrect(event) {
        if (event.key === "Shift" || event.key === "CapsLock") {
            return 
        }

        else if (event.key === "Backspace" || event.key === "Delete") {
            // check what is currently in the input box because they could've done ctrl+backspace which deletes everything
            let wordTyped = event.target.value.trim() // this is the word left over after the backspace
            // get lengths of all previous words to be able to update letterIndex correctly 
            const previousLengths = getPreviousLengths(words, index)
            // add wordTyped.length to previousLengths to place letterIndex however much through the word the user is
            setLetterIndex(previousLengths + wordTyped.length) 

            // change the displayed letters (green or red or white letters) to updated version
            for (let li = previousLengths+wordTyped.length; li < previousLengths + words[index].length; li++) {
                if (letters[li] !== " ") { 
                    lettersEls[li] = <div key={li} className="text-white text-lg opacity-50">{letters[li]}</div>
                }
            }
        }

        else if (event.key === " ") {
            // when spacebar pressed move on to the next word so update all the indexes 
            const wordTyped = event.target.value.trim()

            // socket stuff
            // emit signal word_typed, with details of roomName, username, the index of the word the user is now on (index+1), and current wpm score
            let currentDate = new Date()
            let secondsPassed = (currentDate.getTime() - startTime)/1000 // stores time passed from the start of the test in seconds
            let currentWordsTyped = correctChars/averageCharactersPerWord
            let currentWPM  = (currentWordsTyped/secondsPassed)*60

            // setTimeTaken(finish.getTime() - startTime)
            socket.emit("word_typed", {roomName:roomName, username:username, wordIndex:index+1, currentWPM:currentWPM})

            if (wordTyped == words[index]) {
                // if correct word typed can update indexes as expected
                setChar(char+1)
                setCorrectChars(correctChars+1)
                setLetterIndex(letterIndex+1)
                setIndex(index+1)
                event.target.value = "" // update form to hold an empty string ready for user to type next word
            } else {
                // if incorrect word typed means either part of the word wrong or some letters skipped - premature spacebar
                const wordTyped = event.target.value.trim();
                const previousLengths = getPreviousLengths(words, index)
                // set all incorrect characters to red
                for (let li = previousLengths+wordTyped.length; li < previousLengths + words[index].length; li++) {
                    console.log(li)
                    if (letters[li] !== " ") { 
                        lettersEls[li] = <div className="text-red text-lg" style={{color: "red"}}>{letters[li]}</div>
                    }
                }
                setChar(char+1)
                setLetterIndex(getPreviousLengths(words, index+1))
                setIndex(index+1)
                event.target.value = "" // update form for the same reason as stated above
            }
        } 

        else {
            // get letter type from event.key
            const wordTyped = event.target.value.trim() + event.key
            let letterTyped = event.key

            // update colour of character to be typed depending on whether letter typed is the correct one (green or red)
            if (letters[letterIndex] !== " ") { 
                if (letterTyped == letters[letterIndex]) {
                    setCorrectChars(correctChars+1)
                    lettersEls[letterIndex] = <div className="text-green text-lg" style={{color: "green"}}>{letters[letterIndex]}</div>
                } else {
                    lettersEls[letterIndex] = <div className="text-red text-lg" style={{color: "red"}}>{letters[letterIndex]}</div>
                }
            }

            // update indexes by 1
            setChar(char+1)
            setLetterIndex(letterIndex+1)
        }
    }

    useEffect(() => {
        if (index === words.length) {
            console.log("test done")
            setUsersFinished(usersFinished+1)
        }
    }, [index])

    useEffect(() => {
        const wordsTyped = correctChars/averageCharactersPerWord
        const secondsTaken= timeTaken/1000 // timeTaken is in milliseconds
        const acc= correctChars/char
        console.log("Correct characters typed: " + correctChars)
        console.log("Characters typed: " + char)
        console.log("Accuracy: " + acc*100)
        setWPM((wordsTyped/secondsTaken) * 60)
        setAccuracy(acc*100)
    }, [timeTaken])

    return (
        <div className="py-20 px-11 w-[95vw] ">
            <div className="flex justify-center">
                <div className="flex flex-row flex-wrap">
                    {lettersEls.map((letterEl, idx) => {
                        return (
                            <div>
                                {letterEl}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex-col my-[5vh] flex w-[95vw] items-center justify-center">
                <input onKeyDown={() => checkCorrect(event)} onKeyUp={() => checkDeleted(event)} 
                    autoFocus className="rounded text-black width" type="text" tabIndex={0} 
                    autoComplete="off" autoCapitalize="off" autoCorrect="off" 
                    data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" list="autocompleteOff"/>
            </div>
            {(wpm > 0) 
                ? <div className="flex w-[95vw] justify-around">
                    <div className="w-[30vw] flex flex-col justify-center items-center">
                        <h3 className="font-bold text-2xl mb-2">words per minute</h3>
                        <p>{Math.round(wpm*10)/10}</p>
                    </div>
                    <div className="w-[30vw] flex flex-col justify-center items-center">
                        <h3 className="font-bold text-2xl mb-2">accuracy</h3>
                        <p>{Math.round(accuracy*10)/10}%</p>
                    </div>
                </div>
                :
                <div></div>
            }
        </div>
    )
}

