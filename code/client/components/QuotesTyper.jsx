import {useState, useEffect} from "react"
import { GetQuote } from "../scripts/getQuote"


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

export default function QuotesTyper({ wpm, setWPM, accuracy, setAccuracy, showEndScreen, setShowEndScreen, char, setChar, correctChars, setCorrectChars, timeTaken, setTimeTaken }) {
    const [text, setText] = useState("")
    let words = text.split(" ")
    let letters = getLetters(text)
    const [lettersEls, setLettersEls] = useState([])
    
    const [index, setIndex] = useState(0) // holds the index of the word the person is on
    const [letterIndex, setLetterIndex] = useState(0) // holds the index of the letter the person is on

    const [startTime, setStartTime] = useState(0)
    const averageCharactersPerWord = 5

    useEffect(() => {
        setText(GetQuote())
    }, [])

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
        if (index == 0 && startTime === 0) {
            // if on the first word and the timer hasn't been started start timer by recording start time
            let start = new Date();
            setStartTime(start.getTime());
        }

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
            let finish = new Date()
            setTimeTaken(finish.getTime() - startTime)
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

    useEffect(() => {
        if (wpm > 0) {
            setShowEndScreen(true)
        }
    }, [wpm])

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
                <button className="mt-[5vh] text-white text-3xl" onClick={() => location.reload()}>⟳</button>
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
