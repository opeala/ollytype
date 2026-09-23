import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface WordAttempt {
  word: string;
  typed: string;
  correct: boolean;
  timestamp: number;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  incorrectWords: WordAttempt[];
}

interface PracticeMistake {
  word: string;
  count: number;
  lastAttempt: string;
}

interface MissedWord {
  word: string;
  incorrectCount: number;
  correctCount: number;
  lastMissed: number;
}

interface ProblemLetter {
  letter: string;
  mistakeCount: number;
  correctCount: number;
  lastMissed: number;
}

// Top 1000 most used English words - organized by frequency tiers with proper capitalization and apostrophes
// Tier 1: Top 1-300 most common words (common)
const TIER_1_WORDS = [
  'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with',
  'his', 'they', 'I', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what',
  'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
  'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make',
  'like', 'into', 'him', 'time', 'has', 'two', 'more', 'very', 'after', 'words', 'first', 'where', 'did', 'get',
  'may', 'use', 'work', 'new', 'way', 'could', 'old', 'see', 'now', 'over', 'think', 'also', 'back', 'any', 'good',
  'woman', 'through', 'us', 'life', 'child', 'there', 'work', 'down', 'day', 'get', 'come', 'made', 'may', 'part',
  'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'year', 'live', 'me', 'back', 'give',
  'most', 'very', 'after', 'thing', 'our', 'just', 'name', 'good', 'sentence', 'man', 'think', 'say', 'great',
  'where', 'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean', 'old', 'any', 'same', 'tell', 'boy',
  'follow', 'came', 'want', 'show', 'also', 'around', 'form', 'three', 'small', 'set', 'put', 'end', 'why', 'again',
  'turn', 'here', 'off', 'went', 'call', 'play', 'ask', 'move', 'try', 'kind', 'hand', 'picture', 'again', 'change',
  'off', 'play', 'spell', 'air', 'away', 'animal', 'house', 'point', 'page', 'letter', 'mother', 'answer', 'found',
  'study', 'still', 'learn', 'should', 'America', 'world', 'high', 'every', 'near', 'add', 'food', 'between', 'own',
  'below', 'country', 'plant', 'last', 'school', 'father', 'keep', 'tree', 'never', 'start', 'city', 'earth', 'eye',
  'light', 'thought', 'head', 'under', 'story', 'saw', 'left', "don't", 'few', 'while', 'along', 'might', 'close',
  'something', 'seem', 'next', 'hard', 'open', 'example', 'begin', 'life', 'always', 'those', 'both', 'paper',
  'together', 'got', 'group', 'often', 'run', 'important', 'until', 'children', 'side', 'feet', 'car', 'mile',
  'night', 'walk', 'white', 'sea', 'began', 'grow', 'took', 'river', 'four', 'carry', 'state', 'once', 'book',
  'hear', 'stop', 'without', 'second', 'later', 'miss', 'idea', 'enough', 'eat', 'face', 'watch', 'far', 'Indian',
  'really', 'almost', 'let', 'above', 'girl', 'sometimes', 'mountain', 'cut', 'young', 'talk', 'soon', 'list',
  'song', 'being', 'leave', 'family', "it's"
];

// Tier 2: Words 301-600 (medium)
const TIER_2_WORDS = [
  'body', 'music', 'color', 'stand', 'sun', 'questions', 'fish', 'area', 'mark', 'dog', 'horse', 'birds', 'problem',
  'complete', 'room', 'knew', 'since', 'ever', 'piece', 'told', 'usually', "didn't", 'friends', 'easy', 'heard',
  'order', 'red', 'door', 'sure', 'become', 'top', 'ship', 'across', 'today', 'during', 'short', 'better', 'best',
  'however', 'low', 'hours', 'black', 'products', 'happened', 'whole', 'measure', 'remember', 'early', 'waves',
  'reached', 'listen', 'wind', 'rock', 'space', 'covered', 'fast', 'several', 'hold', 'himself', 'toward', 'five',
  'step', 'morning', 'passed', 'vowel', 'true', 'hundred', 'against', 'pattern', 'numeral', 'table', 'north',
  'slowly', 'money', 'map', 'farm', 'pulled', 'draw', 'voice', 'seen', 'cold', 'cried', 'plan', 'notice', 'south',
  'sing', 'war', 'ground', 'fall', 'king', 'town', 'ill', 'unit', 'figure', 'certain', 'field', 'travel', 'wood',
  'fire', 'upon', 'done', 'English', 'road', 'half', 'ten', 'fly', 'gave', 'box', 'finally', 'wait', 'correct',
  'oh', 'quickly', 'person', 'became', 'shown', 'minutes', 'strong', 'verb', 'stars', 'eat', 'front', 'feel',
  'fact', 'inches', 'street', 'decided', 'contain', 'course', 'surface', 'produce', 'building', 'ocean', 'class',
  'note', 'nothing', 'rest', 'carefully', 'scientists', 'inside', 'wheels', 'stay', 'green', 'known', 'island',
  'week', 'less', 'machine', 'base', 'ago', 'stood', 'plane', 'system', 'behind', 'ran', 'round', 'boat', 'game',
  'force', 'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language',
  'among', 'grand', 'ball', 'yet', 'wave', 'drop', 'heart', 'am', 'present', 'heavy', 'dance', 'engine', 'position',
  'arm', 'wide', 'sail', 'material', 'size', 'vary', 'settle', 'speak', 'weight', 'general', 'ice', 'matter',
  'circle', 'pair', 'include', 'divide', 'syllable', 'felt', 'perhaps', 'pick', 'sudden', 'count', 'square',
  'reason', 'length', 'represent', 'art', 'subject', 'region', 'energy', 'hunt', 'probable', 'bed', 'brother',
  'egg', 'ride', 'cell', 'believe', 'fraction', 'forest', 'sit', 'race', 'window', 'store', 'summer', 'train',
  'sleep', 'prove', 'lone', 'leg', 'exercise', 'wall', 'catch', 'mount', 'wish', 'sky', 'board', 'joy', 'winter',
  'sat', 'written', 'wild', 'instrument', 'kept', 'glass', 'grass', 'cow', 'job', 'edge', 'sign', 'visit',
  'past', 'soft', 'fun', 'bright', 'gas', 'weather', 'month', 'million', 'bear', 'finish', 'happy', 'hope',
  'flower', 'clothe', 'strange', 'gone', 'jump', 'baby', 'eight', 'village', 'meet', 'root', 'buy', 'raise',
  'solve', 'metal', 'whether', 'push', 'seven', 'paragraph', 'third', 'shall', 'held', 'hair', 'describe',
  'cook', 'floor', 'either', 'result', 'burn', 'hill', 'safe', 'cat', 'century', 'consider', 'type', 'law',
  'bit', 'coast', 'copy', 'phrase', 'silent', 'tall', 'sand', 'soil', 'roll', 'temperature', 'finger', 'industry',
  'value', 'fight', 'lie', 'beat', 'excite', 'natural', 'view', 'sense', 'ear', 'else', 'quite', 'broke', 'case',
  'middle', 'kill', 'son', 'lake', 'moment', 'scale', 'loud', 'spring', 'observe', 'child', 'straight', 'consonant',
  'nation', 'dictionary', 'milk', 'speed', 'method', 'organ', 'pay', 'age', 'section', 'dress', 'cloud', 'surprise',
  'quiet', 'stone', 'tiny', 'climb', 'bad', 'oil', 'blood', 'touch', 'grew', 'cent', 'mix', 'team', 'wire', 'cost',
  'lost', 'brown', 'wear', 'garden', 'equal', 'sent', 'choose', 'fell', 'fit', 'flow', 'fair', 'bank', 'collect',
  'save', 'control', 'decimal', 'gentle', 'woman', 'captain', 'practice', 'separate', 'difficult', 'doctor',
  'please', 'protect', 'noon', 'whose', 'locate', 'ring', 'character', 'insect', 'caught', 'period', 'indicate',
  'radio', 'spoke', 'atom', 'human', 'history', 'effect', 'electric', 'expect', 'crop', 'modern', 'element',
  'hit', 'student', 'corner', 'party', 'supply', 'bone', 'rail', 'imagine', 'provide', 'agree', 'thus', 'capital',
  "won't", 'chair', 'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate', 'guess', 'necessary',
  'sharp', 'wing', 'create', 'neighbor', 'wash', 'bat', 'rather', 'crowd', 'corn', 'compare', 'poem', 'string',
  'bell', 'depend', 'meat', 'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin', 'triangle',
  'planet', 'hurry', 'chief', 'colony', 'clock', 'mine', 'tie', 'enter', 'major', 'fresh', 'search', 'send',
  'yellow', 'gun', 'allow', 'print', 'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose', 'continue',
  'block', 'chart', 'hat', 'sell', 'success', 'company', 'subtract', 'event', 'particular', 'deal', 'swim',
  'term', 'opposite', 'wife', 'shoe', 'shoulder', 'spread', 'arrange', 'camp', 'invent', 'cotton', 'born',
  'determine', 'quart', 'nine', 'truck', 'noise', 'level', 'chance', 'gather', 'shop', 'stretch', 'throw',
  'shine', 'property', 'column', 'molecule', 'select', 'wrong', 'gray', 'repeat', 'require', 'broad', 'prepare',
  'salt', 'nose', 'plural', 'anger', 'claim', 'continent', 'oxygen', 'sugar', 'death', 'pretty', 'skill',
  'women', 'season', 'solution', 'magnet', 'silver', 'thank', 'branch', 'match', 'suffix', 'especially', 'fig',
  'afraid', 'huge', 'sister', 'steel', 'discuss', 'forward', 'similar', 'guide', 'experience', 'score', 'apple',
  'bought', 'led', 'pitch', 'coat', 'mass', 'card', 'band', 'rope', 'slip', 'win', 'dream', 'evening', 'condition',
  'feed', 'tool', 'total', 'basic', 'smell', 'valley', 'nor', 'double', 'seat', 'arrive', 'master', 'track',
  'parent', 'shore', 'division', 'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat',
  'glad', 'original', 'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer', 'segment', 'slave',
  'duck', 'instant', 'market', 'degree', 'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur', 'support',
  'speech', 'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient', 'teeth', 'shell',
  'neck'
];

// Tier 3: Words 601-1000 (rare)
const TIER_3_WORDS = [
  'dimension', 'million', 'bill', 'felt', 'tone', 'join', 'suggest', 'clean', 'break', 'lady', 'yard', 'rise',
  'bad', 'blow', 'oil', 'blood', 'touch', 'grew', 'cent', 'mix', 'team', 'wire', 'cost', 'lost', 'brown', 'wear',
  'garden', 'equal', 'sent', 'choose', 'fell', 'fit', 'flow', 'fair', 'bank', 'collect', 'save', 'control',
  'decimal', 'ear', 'else', 'quite', 'broke', 'case', 'middle', 'kill', 'son', 'lake', 'moment', 'scale',
  'loud', 'spring', 'observe', 'child', 'straight', 'consonant', 'nation', 'dictionary', 'milk', 'speed',
  'method', 'organ', 'pay', 'age', 'section', 'dress', 'cloud', 'surprise', 'quiet', 'stone', 'tiny', 'climb',
  'gentle', 'woman', 'captain', 'practice', 'separate', 'difficult', 'doctor', 'please', 'protect',
  'noon', 'whose', 'locate', 'ring', 'character', 'insect', 'caught', 'period', 'indicate', 'radio', 'spoke',
  'atom', 'human', 'history', 'effect', 'electric', 'expect', 'crop', 'modern', 'element', 'hit', 'student',
  'corner', 'party', 'supply', 'bone', 'rail', 'imagine', 'provide', 'agree', 'thus', 'capital', 'chair',
  'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate', 'guess', 'necessary', 'sharp', 'wing',
  'create', 'neighbor', 'wash', 'bat', 'rather', 'crowd', 'corn', 'compare', 'poem', 'string', 'bell', 'depend',
  'meat', 'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin', 'triangle', 'planet', 'hurry',
  'chief', 'colony', 'clock', 'mine', 'tie', 'enter', 'major', 'fresh', 'search', 'send', 'yellow', 'gun',
  'allow', 'print', 'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose', 'continue', 'block', 'chart',
  'hat', 'sell', 'success', 'company', 'subtract', 'event', 'particular', 'deal', 'swim', 'term', 'opposite',
  'wife', 'shoe', 'shoulder', 'spread', 'arrange', 'camp', 'invent', 'cotton', 'born', 'determine', 'quart',
  'nine', 'truck', 'noise', 'level', 'chance', 'gather', 'shop', 'stretch', 'throw', 'shine', 'property',
  'column', 'molecule', 'select', 'wrong', 'gray', 'repeat', 'require', 'broad', 'prepare', 'salt', 'nose',
  'plural', 'anger', 'claim', 'continent', 'oxygen', 'sugar', 'death', 'pretty', 'skill', 'women', 'season',
  'solution', 'magnet', 'silver', 'thank', 'branch', 'match', 'suffix', 'especially', 'fig', 'afraid', 'huge',
  'sister', 'steel', 'discuss', 'forward', 'similar', 'guide', 'experience', 'score', 'apple', 'bought', 'led',
  'pitch', 'coat', 'mass', 'card', 'band', 'rope', 'slip', 'win', 'dream', 'evening', 'condition', 'feed',
  'tool', 'total', 'basic', 'smell', 'valley', 'nor', 'double', 'seat', 'arrive', 'master', 'track', 'parent',
  'shore', 'division', 'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat', 'glad',
  'original', 'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer', 'segment', 'slave',
  'duck', 'instant', 'market', 'degree', 'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur',
  'support', 'speech', 'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient',
  'teeth', 'shell', 'neck', 'oxygen', 'sugar', 'death', 'pretty', 'skill', 'women', 'season', 'solution',
  'magnet', 'silver', 'thank', 'branch', 'match', 'suffix', 'especially', 'fig', 'afraid', 'huge', 'sister',
  'steel', 'discuss', 'forward', 'similar', 'guide', 'experience', 'score', 'apple', 'bought', 'led', 'pitch',
  'coat', 'mass', 'card', 'band', 'rope', 'slip', 'win', 'dream', 'evening', 'condition', 'feed', 'tool',
  'total', 'basic', 'smell', 'valley', 'nor', 'double', 'seat', 'arrive', 'master', 'track', 'parent', 'shore',
  'division', 'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat', 'glad', 'original',
  'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer', 'segment', 'slave', 'duck', 'instant',
  'market', 'degree', 'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur', 'support', 'speech',
  'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient', 'teeth', 'shell', 'neck',
  "can't", "won't", "I'll", "you're", "we're", "they're", "he's", "she's", "that's", "here's", "there's",
  "where's", "what's", "who's", "how's", "let's", "I'm", "you'll", "we'll", "they'll", "I've", "you've",
  "we've", "they've", "I'd", "you'd", "he'd", "she'd", "we'd", "they'd", "isn't", "aren't", "wasn't",
  "weren't", "hasn't", "haven't", "hadn't", "doesn't", "don't", "didn't", "shouldn't", "wouldn't", "couldn't"
];

// Combine all words for letter searching
const ALL_WORDS = [...TIER_1_WORDS, ...TIER_2_WORDS, ...TIER_3_WORDS];

// Storage helpers
const MISSED_WORDS_KEY = 'typing-test-missed-words';
const PROBLEM_LETTERS_KEY = 'typing-test-problem-letters';

const loadMissedWords = (): MissedWord[] => {
  try {
    const stored = localStorage.getItem(MISSED_WORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMissedWords = (missedWords: MissedWord[]) => {
  try {
    localStorage.setItem(MISSED_WORDS_KEY, JSON.stringify(missedWords));
  } catch {
    // Handle storage errors gracefully
  }
};

const loadProblemLetters = (): ProblemLetter[] => {
  try {
    const stored = localStorage.getItem(PROBLEM_LETTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveProblemLetters = (problemLetters: ProblemLetter[]) => {
  try {
    localStorage.setItem(PROBLEM_LETTERS_KEY, JSON.stringify(problemLetters));
  } catch {
    // Handle storage errors gracefully
  }
};

// Results Display Component
function ResultsDisplay({ stats, onPractice, onReset }: {
  stats: TypingStats;
  onPractice: () => void;
  onReset: () => void;
}) {
  const renderIncorrectWords = () => {
    if (stats.incorrectWords.length === 0) {
      return null;
    }

    return (
      <div className="[word-break:break-word] content-stretch flex font-['Roboto_Mono',sans-serif] font-normal gap-[22px] items-center leading-[0] relative shrink-0 text-[22px] w-full whitespace-nowrap flex-wrap">
        {stats.incorrectWords.map((attempt, index) => {
          const word = attempt.word;
          const typed = attempt.typed;

          return (
            <div key={index} className="flex flex-col justify-center relative shrink-0">
              <p className="leading-[30px]">
                {word.split('').map((char, charIndex) => {
                  const typedChar = typed[charIndex];
                  let color = '#011C30'; // Default correct color

                  if (typedChar === undefined || typedChar !== char) {
                    color = '#FF1E1E'; // Incorrect or missing
                  }

                  return <span key={charIndex} style={{ color }}>{char}</span>;
                })}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start relative shrink-0">
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
          {stats.incorrectWords.length > 0 && (
            <>
              <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-[817px]">
                <p className="leading-[30px]">Words to practice:</p>
              </div>
              <div className="content-stretch flex flex-col items-start relative shrink-0">
                <div className="content-stretch flex flex-col items-start px-[23px] py-[25px] relative shrink-0 w-[1102px]">
                  <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
                  {renderIncorrectWords()}
                </div>
              </div>
              <button
                onClick={onPractice}
                className="bg-[#011c30] content-stretch flex h-[44px] items-center justify-center px-[8px] py-[4px] relative shrink-0 cursor-pointer"
              >
                <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
                <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#fdfdfd] text-[22px] whitespace-nowrap">
                  <p className="leading-[30px]">Practice incorrect words ({stats.incorrectWords.length})</p>
                </div>
              </button>
            </>
          )}
          <button
            onClick={onReset}
            className="bg-[#011c30] content-stretch flex h-[44px] items-center justify-center px-[8px] py-[4px] relative shrink-0 cursor-pointer"
          >
            <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
            <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#fdfdfd] text-[22px] whitespace-nowrap">
              <p className="leading-[30px]">Take another test</p>
            </div>
          </button>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[19px] items-start px-[32px] py-[24px] relative shrink-0 w-[243px]">
        <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">WPM</span>
            <span className="leading-[30px]">:{stats.wpm}</span>
          </p>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Accuracy</span>
            <span className="leading-[30px]">:{stats.accuracy}%</span>
          </p>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Correct</span>
            <span className="leading-[30px]">:{stats.correctWords}</span>
          </p>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Incorrect</span>
            <span className="leading-[30px]">:{stats.incorrectWords.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function TypingTest() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [wordAttempts, setWordAttempts] = useState<WordAttempt[]>([]);
  const [testWords, setTestWords] = useState<string[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [missedWords, setMissedWords] = useState<MissedWord[]>(loadMissedWords());
  const [problemLetters, setProblemLetters] = useState<ProblemLetter[]>(loadProblemLetters());
  const [lineStartIndex, setLineStartIndex] = useState(0); // Index where current line 1 starts
  const [showPostPracticeMessage, setShowPostPracticeMessage] = useState(false);
  const [practiceWordsCount, setPracticeWordsCount] = useState(0);

  const TEST_DURATION = 60; // 60 seconds
  const WORDS_PER_LINE = 13;

  // Update problem letters tracking - use functional updates to avoid dependency issues
  const updateProblemLetters = useCallback((wordAttempts: WordAttempt[]) => {
    const now = Date.now();

    setProblemLetters(prevProblemLetters => {
      const updatedProblemLetters = [...prevProblemLetters];

      wordAttempts.forEach(attempt => {
        const target = attempt.word;
        const typed = attempt.typed;
        
        // Track each character in the word
        for (let i = 0; i < target.length; i++) {
          const targetChar = target[i].toLowerCase();
          const typedChar = typed[i]?.toLowerCase() || '';
          
          let existingIndex = updatedProblemLetters.findIndex(pl => pl.letter === targetChar);
          
          if (existingIndex === -1) {
            // Add new letter tracking
            updatedProblemLetters.push({
              letter: targetChar,
              mistakeCount: 0,
              correctCount: 0,
              lastMissed: 0
            });
            existingIndex = updatedProblemLetters.length - 1;
          }
          
          if (targetChar === typedChar) {
            updatedProblemLetters[existingIndex].correctCount += 1;
          } else {
            updatedProblemLetters[existingIndex].mistakeCount += 1;
            updatedProblemLetters[existingIndex].lastMissed = now;
          }
        }
      });

      // Remove letters that have been typed correctly many times
      const filteredLetters = updatedProblemLetters.filter(pl => {
        const accuracy = pl.correctCount / (pl.correctCount + pl.mistakeCount);
        // Keep letters with accuracy below 85% or recent mistakes
        return accuracy < 0.85 || (Date.now() - pl.lastMissed < 86400000);
      });

      saveProblemLetters(filteredLetters);
      return filteredLetters;
    });
  }, []);

  // Update missed words tracking - use functional updates to avoid dependency issues
  const updateMissedWords = useCallback((wordAttempts: WordAttempt[]) => {
    const now = Date.now();

    setMissedWords(prevMissedWords => {
      const updatedMissedWords = [...prevMissedWords];

      wordAttempts.forEach(attempt => {
        const existingIndex = updatedMissedWords.findIndex(mw => mw.word === attempt.word);
        
        if (existingIndex >= 0) {
          if (attempt.correct) {
            updatedMissedWords[existingIndex].correctCount += 1;
            // If they've gotten it right 3 times after missing it, remove from list
            if (updatedMissedWords[existingIndex].correctCount >= 3) {
              updatedMissedWords.splice(existingIndex, 1);
            }
          } else {
            updatedMissedWords[existingIndex].incorrectCount += 1;
            updatedMissedWords[existingIndex].lastMissed = now;
          }
        } else if (!attempt.correct) {
          // Add new missed word
          updatedMissedWords.push({
            word: attempt.word,
            incorrectCount: 1,
            correctCount: 0,
            lastMissed: now
          });
        }
      });

      saveMissedWords(updatedMissedWords);
      return updatedMissedWords;
    });
  }, []);

  // Find words containing problem letters - use current problemLetters directly
  const getWordsWithProblemLetters = useCallback((count: number, currentProblemLetters: ProblemLetter[]): string[] => {
    if (currentProblemLetters.length === 0) return [];
    
    const activeProblemLetters = currentProblemLetters
      .filter(pl => pl.mistakeCount > pl.correctCount)
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, 5); // Focus on top 5 problem letters
    
    if (activeProblemLetters.length === 0) return [];
    
    const wordsWithProblems = ALL_WORDS.filter(word => {
      const lowerWord = word.toLowerCase();
      return activeProblemLetters.some(pl => lowerWord.includes(pl.letter));
    });
    
    // Shuffle and return requested count
    const shuffled = [...wordsWithProblems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  // Generate words from the top 1000 most used English words
  const generateWords = useCallback(() => {
    const words = [];
    
    // Get current state values to avoid dependency issues
    const currentMissedWords = missedWords.filter(mw => mw.incorrectCount > mw.correctCount);
    const problemLetterWords = getWordsWithProblemLetters(60, problemLetters); // 30% of test focused on problem letters
    
    // Add words containing problem letters (30% of the test)
    const problemLetterCount = Math.min(60, problemLetterWords.length);
    for (let i = 0; i < problemLetterCount; i++) {
      words.push(problemLetterWords[i]);
    }
    
    // Add missed words with high probability (30% of the test)
    const missedWordCount = Math.min(60, currentMissedWords.length * 2);
    for (let i = 0; i < missedWordCount; i++) {
      if (currentMissedWords.length > 0) {
        // Prioritize recently missed words and frequently missed words
        const weightedWords = currentMissedWords.map(mw => ({
          ...mw,
          weight: mw.incorrectCount * 2 + (Date.now() - mw.lastMissed < 86400000 ? 3 : 1)
        }));
        
        const totalWeight = weightedWords.reduce((sum, mw) => sum + mw.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const missedWord of weightedWords) {
          random -= missedWord.weight;
          if (random <= 0) {
            words.push(missedWord.word);
            break;
          }
        }
      }
    }
    
    // Fill the rest with regular words (40% of the test)
    for (let i = words.length; i < 200; i++) {
      const rand = Math.random();
      if (rand < 0.5) {
        // 50% from most common words (Tier 1)
        words.push(TIER_1_WORDS[Math.floor(Math.random() * TIER_1_WORDS.length)]);
      } else if (rand < 0.8) {
        // 30% from medium frequency words (Tier 2)
        words.push(TIER_2_WORDS[Math.floor(Math.random() * TIER_2_WORDS.length)]);
      } else {
        // 20% from less common words (Tier 3)
        words.push(TIER_3_WORDS[Math.floor(Math.random() * TIER_3_WORDS.length)]);
      }
    }
    
    // Shuffle the array to mix different word types
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    
    return words;
  }, [missedWords, problemLetters, getWordsWithProblemLetters]);

  // Initialize test words only once on component mount
  useEffect(() => {
    setTestWords(generateWords());
  }, []);

  // Update tracking when test completes
  useEffect(() => {
    if (isComplete && wordAttempts.length > 0) {
      updateMissedWords(wordAttempts);
      updateProblemLetters(wordAttempts);
    }
  }, [isComplete, wordAttempts, updateMissedWords, updateProblemLetters]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTestActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsComplete(true);
            setIsTestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestActive, timeRemaining]);

  const resetTest = useCallback((fromPracticeCompletion: boolean = false) => {
    setIsTestActive(false);
    setHasStarted(false);
    setStartTime(null);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setWordAttempts([]);
    setTimeRemaining(TEST_DURATION);
    setIsComplete(false);
    setShowPractice(false);
    setTestWords(generateWords());
    setLineStartIndex(0);
    setShowPostPracticeMessage(fromPracticeCompletion);
  }, [generateWords]);

  const clearMissedWords = useCallback(() => {
    setMissedWords([]);
    saveMissedWords([]);
  }, []);

  const clearProblemLetters = useCallback(() => {
    setProblemLetters([]);
    saveProblemLetters([]);
  }, []);

  const startTest = useCallback((firstChar?: string) => {
    if (!hasStarted) {
      setHasStarted(true);
      setIsTestActive(true);
      setStartTime(Date.now());
      setShowPostPracticeMessage(false); // Clear message when test starts
      if (firstChar) {
        setCurrentInput(firstChar);
      }
    }
  }, [hasStarted]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Don't handle keys if test is complete or in practice mode
    if (isComplete) return;

    // Start test on first valid keypress and include the character
    if (!hasStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      startTest(e.key);
      return; // The character will be added by startTest
    }

    // Don't process further if test not active or time is up
    if (!isTestActive || timeRemaining <= 0) return;

    if (e.key === ' ') {
      e.preventDefault();

      if (currentInput.trim()) {
        const currentWord = testWords[currentWordIndex];
        const isCorrect = currentInput.trim() === currentWord;

        const attempt: WordAttempt = {
          word: currentWord,
          typed: currentInput.trim(),
          correct: isCorrect,
          timestamp: Date.now()
        };

        setWordAttempts(prev => [...prev, attempt]);
        setCurrentInput('');

        // Check if we just completed the last word of line 1 (BEFORE incrementing)
        const lastWordOfLine1Index = lineStartIndex + WORDS_PER_LINE - 1;
        if (currentWordIndex === lastWordOfLine1Index) {
          // Scroll: Line 2 becomes Line 1
          setLineStartIndex(prev => prev + WORDS_PER_LINE);
        }

        const nextWordIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextWordIndex);

        // Generate more words if we're running low
        if (nextWordIndex >= testWords.length - 20) {
          setTestWords(prev => [...prev, ...generateWords()]);
        }
      }
    } else if (e.key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      setCurrentInput(prev => prev + e.key);
    }
  }, [isTestActive, isComplete, timeRemaining, currentInput, currentWordIndex, testWords, generateWords, hasStarted, startTest, lineStartIndex, WORDS_PER_LINE]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const calculateStats = (): TypingStats => {
    if (!startTime || wordAttempts.length === 0) {
      return {
        wpm: 0,
        accuracy: 0,
        totalWords: 0,
        correctWords: 0,
        incorrectWords: []
      };
    }

    const timeElapsed = (TEST_DURATION - timeRemaining) / 60; // in minutes
    const correctWords = wordAttempts.filter(a => a.correct).length;
    const incorrectWords = wordAttempts.filter(a => !a.correct);
    
    return {
      wpm: timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0,
      accuracy: Math.round((correctWords / wordAttempts.length) * 100),
      totalWords: wordAttempts.length,
      correctWords,
      incorrectWords
    };
  };

  const stats = calculateStats();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordFrequency = (word: string) => {
    if (TIER_1_WORDS.includes(word)) return 'common';
    if (TIER_2_WORDS.includes(word)) return 'medium';
    if (TIER_3_WORDS.includes(word)) return 'rare';
    return 'medium';
  };

  const hasWordsWithProblemLetters = (word: string | undefined) => {
    // Add null checks for word and problemLetters
    if (!word || typeof word !== 'string' || problemLetters.length === 0) return false;
    
    const activeProblemLetters = problemLetters.filter(pl => pl && pl.mistakeCount > pl.correctCount);
    if (activeProblemLetters.length === 0) return false;
    
    const lowerWord = word.toLowerCase();
    return activeProblemLetters.some(pl => pl && pl.letter && lowerWord.includes(pl.letter));
  };

  const renderWordDisplay = () => {
    // Add safety check for testWords
    if (!testWords || testWords.length === 0) {
      return (
        <div className="content-stretch flex flex-col gap-[13px] items-start px-[23px] py-[25px] relative shrink-0 w-full max-w-[1102px]">
          <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
          <div className="text-[rgba(1,28,48,0.6)] font-['Roboto_Mono',sans-serif]">Loading words...</div>
        </div>
      );
    }

    // Line 1: Active line (where user types) - starts at lineStartIndex
    const line1Words = testWords.slice(lineStartIndex, lineStartIndex + WORDS_PER_LINE);
    // Line 2: Preview line - starts after line 1
    const line2Words = testWords.slice(lineStartIndex + WORDS_PER_LINE, lineStartIndex + (WORDS_PER_LINE * 2));

    const renderWord = (word: string, actualIndex: number, isLine2: boolean) => {
      const isCurrent = actualIndex === currentWordIndex;
      const isCompleted = actualIndex < currentWordIndex;
      const attempt = wordAttempts.find((a, i) => i === actualIndex);

      // Line 2 words are always shown in preview color
      if (isLine2) {
        return (
          <div key={`${word}-${actualIndex}`} className="flex flex-col justify-center relative shrink-0">
            <p className="leading-[30px] text-[rgba(1,28,48,0.4)]">{word}</p>
          </div>
        );
      }

      // Line 1 logic
      if (isCurrent) {
        // Current word being typed - show character-by-character feedback
        return (
          <div key={`${word}-${actualIndex}`} className="flex flex-col justify-center relative shrink-0">
            <p className="leading-[30px]">
              {word.split('').map((char, charIndex) => {
                const typedChar = currentInput[charIndex];
                const isNextLetter = charIndex === currentInput.length;
                let color = '#7C8288'; // Not yet typed

                if (typedChar !== undefined) {
                  if (typedChar === char) {
                    color = '#011C30'; // Correct
                  } else {
                    color = '#FF1E1E'; // Incorrect
                  }
                }

                return (
                  <span
                    key={charIndex}
                    style={{
                      color,
                      borderBottom: isNextLetter ? '2px solid #011C30' : 'none'
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </p>
          </div>
        );
      } else if (isCompleted) {
        if (attempt?.correct) {
          // All letters correct - show in #011C30
          return (
            <div key={`${word}-${actualIndex}`} className="flex flex-col justify-center relative shrink-0">
              <p className="leading-[30px] text-[#011c30]">{word}</p>
            </div>
          );
        } else {
          // Show character-by-character feedback for completed incorrect words
          const typed = attempt?.typed || '';
          return (
            <div key={`${word}-${actualIndex}`} className="flex flex-col justify-center relative shrink-0">
              <p className="leading-[30px]">
                {word.split('').map((char, charIndex) => {
                  const typedChar = typed[charIndex];
                  let color = '#011C30'; // Default correct color

                  if (typedChar === undefined || typedChar !== char) {
                    color = '#FF1E1E'; // Incorrect or missing
                  }

                  return <span key={charIndex} style={{ color }}>{char}</span>;
                })}
              </p>
            </div>
          );
        }
      } else {
        // Future word in line 1 - show each letter in not-yet-typed color
        return (
          <div key={`${word}-${actualIndex}`} className="flex flex-col justify-center relative shrink-0">
            <p className="leading-[30px]">
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} style={{ color: '#7C8288' }}>{char}</span>
              ))}
            </p>
          </div>
        );
      }
    };

    return (
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full max-w-[1102px]">
        <div className="content-stretch flex flex-col gap-[13px] items-start px-[23px] py-[25px] relative shrink-0 w-full">
          <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />

          {/* Line 1: Active line */}
          <div className="[word-break:break-word] content-stretch flex font-['Roboto_Mono',sans-serif] font-normal gap-[22px] items-center leading-[0] relative shrink-0 text-[22px] w-full whitespace-nowrap">
            {line1Words.map((word, index) => {
              const actualIndex = lineStartIndex + index;
              return renderWord(word, actualIndex, false);
            })}
          </div>

          {/* Line 2: Preview line */}
          <div className="[word-break:break-word] content-stretch flex font-['Roboto_Mono',sans-serif] font-normal gap-[22px] items-center leading-[0] relative shrink-0 text-[rgba(1,28,48,0.4)] text-[22px] w-full whitespace-nowrap">
            {line2Words.map((word, index) => {
              const actualIndex = lineStartIndex + WORDS_PER_LINE + index;
              return renderWord(word, actualIndex, true);
            })}
          </div>
        </div>
      </div>
    );
  };

  if (showPractice) {
    return (
      <PracticeSession
        incorrectWords={stats.incorrectWords}
        onComplete={() => setShowPractice(false)}
        onReset={() => resetTest(true)}
      />
    );
  }

  const activeProblemLetters = problemLetters.filter(pl => pl && pl.mistakeCount > pl.correctCount);

  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[65px] items-start relative shrink-0 flex-1">
        {showPostPracticeMessage && !hasStarted && !isComplete ? (
          <div className="content-stretch flex flex-col gap-[26px] items-start relative shrink-0">
            <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-[817px]">
              <p className="leading-[30px]">{practiceWordsCount} practice words added to the test</p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-[817px]">
              <p className="leading-[30px]">Start typing to begin the test. Your first keypress starts the time and is included in your score</p>
            </div>
          </div>
        ) : (
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] max-w-[817px]">
            <p className="leading-[30px]">Start typing to begin the test. Your first keypress starts the time and is included in your score</p>
          </div>
        )}
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
          {!hasStarted && !isComplete ? (
            renderWordDisplay()
          ) : isComplete ? (
            <ResultsDisplay
              stats={stats}
              onPractice={() => {
                setPracticeWordsCount(stats.incorrectWords.length);
                setShowPractice(true);
              }}
              onReset={() => resetTest(false)}
            />
          ) : (
            renderWordDisplay()
          )}
        </div>
      </div>
      <div className="bg-[#011c30] content-stretch flex h-[82px] items-center justify-center p-[10px] relative shrink-0 w-[237px]">
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fdfdfd] text-[22px] whitespace-nowrap">
          <p className="leading-[30px]">Time:{formatTime(timeRemaining)}</p>
        </div>
      </div>
    </div>
  );
}

// Practice Session Component
function PracticeSession({ incorrectWords, onComplete, onReset }: {
  incorrectWords: WordAttempt[],
  onComplete: () => void,
  onReset: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [practiceAttempts, setPracticeAttempts] = useState<WordAttempt[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [practiceMistakes, setPracticeMistakes] = useState<PracticeMistake[]>([]);
  const [hasError, setHasError] = useState(false);

  const currentWord = incorrectWords[currentIndex]?.word || '';

  const addMistake = useCallback((word: string, typedAttempt: string) => {
    setPracticeMistakes(prev => {
      const existingIndex = prev.findIndex(m => m.word === word);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + 1,
          lastAttempt: typedAttempt
        };
        return updated;
      } else {
        return [...prev, { word, count: 1, lastAttempt: typedAttempt }];
      }
    });
  }, []);

  const checkCharacterByCharacter = useCallback((input: string, target: string) => {
    // Check if current input matches the target word so far (exact match including case and punctuation)
    if (input.length > target.length) return false;

    for (let i = 0; i < input.length; i++) {
      if (input[i] !== target[i]) {
        return false;
      }
    }
    return true;
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isActive) return;

    if (e.key === ' ') {
      e.preventDefault();

      if (currentInput.trim() && !hasError) {
        const isCorrect = currentInput.trim() === currentWord;

        if (!isCorrect) {
          addMistake(currentWord, currentInput.trim());
        }

        const attempt: WordAttempt = {
          word: currentWord,
          typed: currentInput.trim(),
          correct: isCorrect,
          timestamp: Date.now()
        };

        setPracticeAttempts(prev => [...prev, attempt]);
        setCurrentInput('');
        setHasError(false);

        if (currentIndex < incorrectWords.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsActive(false);
        }
      }
    } else if (e.key === 'Backspace') {
      setCurrentInput(prev => {
        const newInput = prev.slice(0, -1);
        // Check if the new input is valid
        const isValid = checkCharacterByCharacter(newInput, currentWord);
        setHasError(!isValid);
        return newInput;
      });
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const newInput = currentInput + e.key;
      const isValid = checkCharacterByCharacter(newInput, currentWord);

      if (!isValid) {
        // Wrong character typed - reset the input and record mistake
        addMistake(currentWord, newInput);
        setCurrentInput('');
        setHasError(true);
        // Brief visual feedback
        setTimeout(() => setHasError(false), 200);
      } else {
        setCurrentInput(newInput);
        setHasError(false);
      }
    }
  }, [isActive, currentInput, currentWord, currentIndex, incorrectWords.length, hasError, checkCharacterByCharacter, addMistake]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isActive, handleKeyPress]);

  const practiceCorrect = practiceAttempts.filter(a => a.correct).length;
  const practiceAccuracy = practiceAttempts.length > 0 ? Math.round((practiceCorrect / practiceAttempts.length) * 100) : 0;
  const practiceIncorrect = practiceAttempts.filter(a => !a.correct).length;

  // Get remaining words to practice
  const remainingWords = incorrectWords.slice(currentIndex);

  const renderRemainingWords = () => {
    return (
      <div className="[word-break:break-word] content-stretch flex font-['Roboto_Mono',sans-serif] font-normal gap-[22px] items-center leading-[0] relative shrink-0 text-[22px] w-full whitespace-nowrap flex-wrap">
        {remainingWords.map((attempt, index) => {
          const word = attempt.word;
          const isCurrent = index === 0;

          return (
            <div key={index} className="flex flex-col justify-center relative shrink-0">
              <p className="leading-[30px]">
                {word.split('').map((char, charIndex) => {
                  let color = '#FF1E1E'; // Default to red for words to practice

                  if (isCurrent) {
                    const typedChar = currentInput[charIndex];
                    const isNextLetter = charIndex === currentInput.length;

                    if (typedChar !== undefined) {
                      if (typedChar === char) {
                        color = '#011C30'; // Correct
                      } else {
                        color = '#FF1E1E'; // Incorrect
                      }
                    } else {
                      color = '#FF1E1E'; // Not yet typed
                    }

                    return (
                      <span
                        key={charIndex}
                        style={{
                          color,
                          borderBottom: isNextLetter ? '2px solid #011C30' : 'none'
                        }}
                      >
                        {char}
                      </span>
                    );
                  }

                  return <span key={charIndex} style={{ color }}>{char}</span>;
                })}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Practice complete screen
  if (!isActive) {
    // Calculate WPM for practice (assuming average of 1 second per word)
    const practiceWPM = practiceAttempts.length > 0 ? Math.round((practiceCorrect / (practiceAttempts.length / 60)) || 0) : 0;

    return (
      <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[65px] items-start relative shrink-0">
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-[817px]">
            <p className="leading-[30px]">Practice complete</p>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
            <div className="content-stretch flex flex-col items-start relative shrink-0">
              <button
                onClick={onReset}
                className="bg-[#011c30] content-stretch flex h-[44px] items-center justify-center px-[8px] py-[4px] relative shrink-0 cursor-pointer"
              >
                <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
                <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#fdfdfd] text-[22px] whitespace-nowrap">
                  <p className="leading-[30px]">Take another test</p>
                </div>
              </button>
            </div>
            {practiceIncorrect > 0 && (
              <button
                onClick={onComplete}
                className="bg-[#011c30] content-stretch flex h-[44px] items-center justify-center px-[8px] py-[4px] relative shrink-0 cursor-pointer"
              >
                <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
                <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#fdfdfd] text-[22px] whitespace-nowrap">
                  <p className="leading-[30px]">Practice incorrect words ({practiceIncorrect})</p>
                </div>
              </button>
            )}
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start px-[32px] py-[24px] relative shrink-0 w-[243px]">
          <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
            <p>
              <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">WPM</span>
              <span className="leading-[30px]">:{practiceWPM}</span>
            </p>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
            <p>
              <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Accuracy</span>
              <span className="leading-[30px]">:{practiceAccuracy}%</span>
            </p>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
            <p>
              <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Correct</span>
              <span className="leading-[30px]">:{practiceCorrect}</span>
            </p>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
            <p>
              <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Incorrect</span>
              <span className="leading-[30px]">:{practiceIncorrect}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active practice screen
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start relative shrink-0">
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-[817px]">
            <p>
              <span className="leading-[30px]">Progress: </span>
              <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-normal leading-[30px]">
                {currentIndex + 1}/{incorrectWords.length}
              </span>
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0">
            <div className="content-stretch flex flex-col items-start px-[23px] py-[25px] relative shrink-0 w-[1102px]">
              <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
              {renderRemainingWords()}
            </div>
          </div>
          <button
            onClick={onComplete}
            className="bg-[#011c30] content-stretch flex h-[44px] items-center justify-center px-[8px] py-[4px] relative shrink-0 cursor-pointer"
          >
            <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
            <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#fdfdfd] text-[22px] whitespace-nowrap">
              <p className="leading-[30px]">Back to results</p>
            </div>
          </button>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[24px] items-start px-[32px] py-[24px] relative shrink-0 w-[243px]">
        <div aria-hidden className="absolute border border-[#011c30] border-solid inset-0 pointer-events-none" />
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Mistakes</span>
            <span className="leading-[30px]">:{practiceMistakes.reduce((sum, m) => sum + m.count, 0)}</span>
          </p>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Accuracy</span>
            <span className="leading-[30px]">:{practiceAccuracy}%</span>
          </p>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Correct</span>
            <span className="leading-[30px]">:{practiceCorrect}</span>
          </p>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[22px] text-[#011c30] w-full">
          <p>
            <span className="[word-break:break-word] font-['Roboto_Mono',sans-serif] font-bold leading-[30px]">Attempts</span>
            <span className="leading-[30px]">:{practiceAttempts.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Typing Analysis Component
function TypingAnalysis({ attempts, problemLetters }: { attempts: WordAttempt[], problemLetters: ProblemLetter[] }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeTypingPatterns = () => {
    const incorrectAttempts = attempts.filter(a => a.correct);
    
    // Character-level analysis
    const characterMistakes: { [key: string]: number } = {};
    const positionMistakes: { [key: number]: number } = {};
    const lengthMistakes: { [key: number]: number } = {};
    const frequencyMistakes: { [key: string]: number } = {};
    const capitalizationMistakes: number = incorrectAttempts.filter(attempt => 
      attempt.word.toLowerCase() === attempt.typed.toLowerCase() && attempt.word !== attempt.typed
    ).length;
    const apostropheMistakes: number = incorrectAttempts.filter(attempt =>
      attempt.word.replace(/'/g, '') === attempt.typed.replace(/'/g, '') && attempt.word !== attempt.typed
    ).length;
    
    incorrectAttempts.forEach(attempt => {
      const target = attempt.word;
      const typed = attempt.typed;
      
      // Track word length issues
      lengthMistakes[target.length] = (lengthMistakes[target.length] || 0) + 1;
      
      // Track frequency issues
      const frequency = TIER_1_WORDS.includes(attempt.word) ? 'common' :
                       TIER_2_WORDS.includes(attempt.word) ? 'medium' : 'rare';
      frequencyMistakes[frequency] = (frequencyMistakes[frequency] || 0) + 1;
      
      // Character by character comparison
      for (let i = 0; i < Math.max(target.length, typed.length); i++) {
        if (target[i] !== typed[i]) {
          const targetChar = target[i] || 'missing';
          const typedChar = typed[i] || 'extra';
          const mistake = `${targetChar} → ${typedChar}`;
          characterMistakes[mistake] = (characterMistakes[mistake] || 0) + 1;
          positionMistakes[i] = (positionMistakes[i] || 0) + 1;
        }
      }
    });

    const topProblemLetters = problemLetters
      .filter(pl => pl && pl.mistakeCount > pl.correctCount)
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, 10);

    return {
      characterMistakes: Object.entries(characterMistakes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      positionMistakes: Object.entries(positionMistakes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      lengthMistakes: Object.entries(lengthMistakes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      frequencyMistakes: Object.entries(frequencyMistakes)
        .sort(([,a], [,b]) => b - a),
      capitalizationMistakes,
      apostropheMistakes,
      topProblemLetters
    };
  };

  if (!showAnalysis) {
    return <Button onClick={() => setShowAnalysis(true)}>View Typing Analysis</Button>;
  }

  const analysis = analyzeTypingPatterns();

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3>Typing Pattern Analysis</h3>
            <Button variant="outline" onClick={() => setShowAnalysis(false)}>Close</Button>
          </div>
          
          <div className="space-y-4">
            {analysis.topProblemLetters.length > 0 && (
              <div>
                <h4>Problem Letters</h4>
                <div className="space-y-2">
                  {analysis.topProblemLetters.map((letter, index) => (
                    <div key={index} className="flex justify-between bg-muted p-2 border border-foreground">
                      <span className="font-mono text-lg">{letter.letter}</span>
                      <span>{letter.mistakeCount} mistakes vs {letter.correctCount} correct</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4>Most Common Character Mistakes</h4>
              <div className="space-y-2">
                {analysis.characterMistakes.map(([mistake, count]) => (
                  <div key={mistake} className="flex justify-between bg-muted p-2 border border-border">
                    <span className="font-mono">{mistake}</span>
                    <span>{count} times</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4>Special Character Issues</h4>
              <div className="space-y-2">
                <div className="flex justify-between bg-muted p-2 border border-border">
                  <span>Capitalization mistakes</span>
                  <span>{analysis.capitalizationMistakes}</span>
                </div>
                <div className="flex justify-between bg-muted p-2 border border-border">
                  <span>Apostrophe mistakes</span>
                  <span>{analysis.apostropheMistakes}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4>Word Frequency Performance</h4>
              <div className="space-y-2">
                {analysis.frequencyMistakes.map(([frequency, count]) => (
                  <div key={frequency} className="flex justify-between bg-muted p-2 border border-border">
                    <span className="capitalize">{frequency} words</span>
                    <span>{count} mistakes</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4>Problem Positions in Words</h4>
              <div className="space-y-2">
                {analysis.positionMistakes.map(([position, count]) => (
                  <div key={position} className="flex justify-between bg-muted p-2 border border-border">
                    <span>Position {parseInt(position) + 1}</span>
                    <span>{count} mistakes</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4>Word Length Difficulties</h4>
              <div className="space-y-2">
                {analysis.lengthMistakes.map(([length, count]) => (
                  <div key={length} className="flex justify-between bg-muted p-2 border border-border">
                    <span>{length}-character words</span>
                    <span>{count} mistakes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 border border-foreground">
            <h4 className="text-foreground">Recommendations:</h4>
            <ul className="text-foreground space-y-1 mt-2">
              {analysis.topProblemLetters.length > 0 && (
                <li>• Focus on practicing words with letters: {analysis.topProblemLetters.slice(0, 3).map(pl => pl.letter).join(', ')}</li>
              )}
              {analysis.capitalizationMistakes > 0 && (
                <li>• Pay closer attention to proper capitalization (I, names, etc.)</li>
              )}
              {analysis.apostropheMistakes > 0 && (
                <li>• Practice contractions and words with apostrophes</li>
              )}
              {analysis.frequencyMistakes.length > 0 && (
                <li>• Focus on practicing {analysis.frequencyMistakes[0][0]} frequency words</li>
              )}
              <li>• Your next test will include more words with your problem letters</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}