import english from "./data/english.json"

export const GetText = (textLength) => {
    let res= ""
    let words = english.words
    while (textLength >= 2) {
        res += words[Math.floor(Math.random() * (words.length-1))] + " "
        textLength--
    }
    res += words[0]
    return res
}

