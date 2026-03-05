// backend/utils/profanityFilter.js

const tagalogWords = [
    "putangina", "putang ina", "tangina", "tang ina", "pucha", "puchangala",
    "gago", "gaga", "bobo", "boba", "tarantado", "tarantada",
    "kupal", "hayop ka", "ulol", "bulol", "hindot", "kantot", "bayag",
    "tite", "kiki", "puki", "pekpek", "pukinginamo", "putanginamo",
    "lintek", "punyeta", "leche", "bwisit", "pakshet", "hudas",
    "syet", "tang-ina", "p-u-t-a", "puta"
];

const englishWords = [
    "fuck", "fucking", "fucker", "shit", "shitty", "ass", "asshole",
    "bitch", "bastard", "dick", "pussy", "cunt", "motherfucker",
    "cock", "slut", "whore", "prick", "wanker", "bullshit",
    "nigga", "nigger"
];

const allBadWords = [...new Set([...tagalogWords, ...englishWords])];

/**
 * Censors profanity in a string by replacing them with asterisks
 * @param {string} text - The string to censor
 * @returns {string} - The censored string
 */
const censorProfanity = (text) => {
    if (!text || typeof text !== "string") return text;

    let censoredText = text;

    // Sort by length descending to handle phrases like "putang ina" before "putang"
    const sortedWords = allBadWords.sort((a, b) => b.length - a.length);

    sortedWords.forEach(word => {
        // Escape special characters for regex
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // We use a regex that matches the word/phrase. 
        // For single words, we often want word boundaries, but phrases or Tagalog variations 
        // can be tricky. Here we use a balanced approach.
        const regex = new RegExp(`(\\b${escapedWord}\\b)`, "gi");

        // For phrases containing spaces, \b still works reasonably well at start/end
        censoredText = censoredText.replace(regex, (match) => {
            return "*".repeat(match.length);
        });
    });

    // Secondary pass for words that might not have boundaries but are clearly bad (e.g. "putanginamo")
    // and aren't parts of common safe words.
    const aggressiveWords = ["putang", "tangina", "tarantado", "pukinginamo", "putanginamo"];
    aggressiveWords.forEach(word => {
        const regex = new RegExp(word, "gi");
        censoredText = censoredText.replace(regex, (match) => "*".repeat(match.length));
    });

    return censoredText;
};

module.exports = {
    censorProfanity,
    badWordsList: allBadWords
};
