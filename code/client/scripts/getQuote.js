import quotesDB from "./data/quotesDB.json"

export const GetQuote = () => {
    let res= ""
    let quotes = quotesDB.quotes 
    res = quotes[Math.floor(Math.random() * (quotes.length-1))]
    return res
}

