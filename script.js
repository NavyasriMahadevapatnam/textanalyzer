import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "firebase/auth";

// Check if user is logged in via Firebase
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        // Welcome the user with their account details
        const headerP = document.querySelector('header p');
        if (headerP) {
            headerP.innerText = `Welcome, ${user.displayName || user.email}!`;
        }
    }
});

//elements
const textInput = document.getElementById('text-input');

//buttons
const clearBtn = document.getElementById('clear-btn');
const uppercaseBtn = document.getElementById('uppercase-btn');
const lowercaseBtn = document.getElementById('lowercase-btn');
const copyBtn = document.getElementById('copy-btn');
const speakBtn = document.getElementById('speak-btn');
const stopBtn = document.getElementById('stop-btn');
const fixSpellingBtn = document.getElementById('fix-spelling-btn');

//stat result elements
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const charNoSpaceCountEl = document.getElementById('char-nospace-count');
const sentenceCountEl = document.getElementById('sentence-count');
const paragraphCountEl = document.getElementById('paragraph-count');
const readingTimeEl = document.getElementById('reading-time');
const longestWordEl = document.getElementById('longest-word');

//event listener
textInput.addEventListener('input', function() {
    let text = textInput.value;

    //call functions
    countCharacters(text);
    countWords(text);
    countSentences(text);
    countParagraphs(text);
    calculateReadingTime(text);
    findLongestWord(text);
});

//Calculate characters (with and without space)
function countCharacters(text) {
    // Total characters length
    let totalChars = text.length;
    charCountEl.innerText = totalChars;

    //Characters without spaces (replacing all spaces with nothing)
    let textNoSpaces = text.replace(/\s+/g, '');
    charNoSpaceCountEl.innerText = textNoSpaces.length;
}

//Calculate words
function countWords(text) {
    let trimmedText = text.trim();
    if (trimmedText === "") {
        wordCountEl.innerText = 0;
        return;
    }

    let wordsArray = trimmedText.split(/\s+/);
    wordCountEl.innerText = wordsArray.length;
}

//Calculate sentences
function countSentences(text) {
    // Split text using basic sentence enders (. ! ?)
    // Match any sentence boundary
    if (text.trim() === '') {
        sentenceCountEl.innerText = 0;
        return;
    }
    
    // Simple regex to count split points
    let sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    sentenceCountEl.innerText = sentences.length;
}

// Calculate reading time (assuming 200 words per minute for a standard reader)
function calculateReadingTime(text) {
    let trimmedText = text.trim();
    if (trimmedText === "") {
        readingTimeEl.innerText = "0 min";
        return;
    }

    let wordsArray = trimmedText.split(/\s+/);
    let words = wordsArray.length;
    
    let timeInMinutes = words / 200;
    
    // If it takes less than a minute
    if (timeInMinutes < 1) {
        let seconds = Math.ceil(timeInMinutes * 60);
        readingTimeEl.innerText = seconds + " sec";
    } else {
        // Round to 1 decimal place if it's over a minute
        readingTimeEl.innerText = timeInMinutes.toFixed(1) + " min";
    }
}

// Find the longest word
function findLongestWord(text) {
    let wordsArray = text.match(/[a-zA-Z0-9]+/g);
    
    if (!wordsArray || wordsArray.length === 0) {
        longestWordEl.innerText = "-";
        return;
    }

    let longest = "";
    for (let i = 0; i < wordsArray.length; i++) {
        if (wordsArray[i].length > longest.length) {
            longest = wordsArray[i];
        }
    }

    // Limit length to avoid breaking the UI layout
    if (longest.length > 20) {
        longestWordEl.innerText = longest.substring(0, 17) + "...";
    } else {
        longestWordEl.innerText = longest;
    }
}

// Calculate paragraphs
function countParagraphs(text) {
    if (text.trim() === '') {
        paragraphCountEl.innerText = 0;
        return;
    }
    let paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    paragraphCountEl.innerText = paragraphs.length;
}

// Extra feature buttons
clearBtn.addEventListener('click', function() {
    textInput.value = "";
    // Manually trigger input event to reset all counters
    textInput.dispatchEvent(new Event('input'));
});

uppercaseBtn.addEventListener('click', function() {
    textInput.value = textInput.value.toUpperCase();
    textInput.dispatchEvent(new Event('input'));
});

lowercaseBtn.addEventListener('click', function() {
    textInput.value = textInput.value.toLowerCase();
    textInput.dispatchEvent(new Event('input'));
});

copyBtn.addEventListener('click', function() {
    textInput.select();
    document.execCommand('copy');
    alert("Text copied to clipboard!");
});

speakBtn.addEventListener('click', function() {
    if ('speechSynthesis' in window) {
        let msg = new SpeechSynthesisUtterance(textInput.value);
        window.speechSynthesis.speak(msg);
    } else {
        alert("Sorry, your browser doesn't support text to speech!");
    }
});

stopBtn.addEventListener('click', function() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
});

fixSpellingBtn.addEventListener('click', async function() {
    let text = textInput.value;
    if (!text.trim()) return;
    
    // Show loading state
    let originalText = fixSpellingBtn.innerText;
    fixSpellingBtn.innerText = "Fixing...";
    fixSpellingBtn.disabled = true;

    try {
        // Using a free spell check API (LanguageTool) that students often use in projects!
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: text,
                language: 'en-US'
            })
        });

        const data = await response.json();

        if (data.matches && data.matches.length > 0) {
            // Sort matches from end to start so replacing doesn't mess up the index offsets!
            let matches = data.matches.sort((a, b) => b.offset - a.offset);
            
            for (let match of matches) {
                if (match.replacements && match.replacements.length > 0) {
                    let replacement = match.replacements[0].value;
                    let before = text.substring(0, match.offset);
                    let after = text.substring(match.offset + match.length);
                    text = before + replacement + after;
                }
            }
            
            textInput.value = text;
            textInput.dispatchEvent(new Event('input')); // Update counters
            alert("Spelling mistakes fixed successfully!");
        } else {
            alert("No spelling mistakes found!");
        }
    } catch (error) {
        console.error("Error fixing spelling:", error);
        alert("Oops! Could not connect to the spell check service. Please check your internet connection.");
    }

    // Reset button state
    fixSpellingBtn.innerText = originalText;
    fixSpellingBtn.disabled = false;
});

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}
