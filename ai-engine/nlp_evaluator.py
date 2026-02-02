import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem import PorterStemmer

ps = PorterStemmer()

TECH_KEYWORDS = {
    'Technical': [
        'oop', 'polymorphism', 'encapsulation', 'inheritance', 'abstraction',
        'sql', 'query', 'database', 'table', 'join', 'select', 'where',
        'dsa', 'data structure', 'algorithm', 'array', 'linked list', 'tree',
        'binary', 'graph', 'hash', 'sort', 'search', 'complexity',
        'c programming', 'pointer', 'memory', 'function', 'variable',
        'java', 'jvm', 'class', 'object', 'method', 'interface',
        'os', 'operating system', 'process', 'thread', 'scheduling', 'memory',
        'networking', 'protocol', 'http', 'tcp', 'ip', 'socket',
        'dbms', 'acid', 'transaction', 'index', 'normalization',
        'system design', 'scalability', 'cache', 'lru', 'distributed',
        'dp', 'dynamic programming', 'recursion', 'optimization',
        'hashing', 'hash table', 'collision', 'bucket'
    ],
    'Coding': [
        'linked list', 'reverse', 'algorithm', 'time complexity',
        'code', 'function', 'implementation', 'solution', 'approach',
        'optimize', 'efficient', 'iteration', 'recursion'
    ],
    'Aptitude': [
        'probability', 'combinatorics', 'ratio', 'speed', 'distance',
        'permutation', 'combination', 'series', 'sequence', 'pattern',
        'logical', 'reasoning', 'puzzle', 'analytical', 'quantitative',
        'math', 'calculation', 'formula', 'equation', 'solve'
    ],
    'HR': [
        'challenge', 'team', 'conflict', 'leadership', 'communication',
        'experience', 'project', 'achievement', 'skill', 'collaboration',
        'motivation', 'goal', 'career', 'growth', 'learning'
    ],
    'General': [
        'explain', 'describe', 'understand', 'concept', 'principle',
        'example', 'application', 'practice', 'experience', 'knowledge'
    ],
    'Reverse': ['product', 'roadmap', 'vision', 'strategy'],
    'Cultural': ['diversity', 'inclusion', 'respect', 'collaboration']
}


def tokenize(text):
    return [ps.stem(tok) for tok in re.findall(r"[A-Za-z']+", text.lower())]


def grammar_score(text):
    # Simple heuristic: average sentence length and punctuation presence
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return 0.5
    avg_len = sum(len(s.split()) for s in sentences) / len(sentences)
    punct_ratio = sum(1 for c in text if c in ',;:') / max(len(text), 1)
    score = max(0.0, min(1.0, 0.6 + 0.02 * avg_len + 5 * punct_ratio))
    return score


def clarity_score(text):
    words = tokenize(text)
    unique_ratio = len(set(words)) / max(len(words), 1)
    return max(0.0, min(1.0, 0.4 + 0.6 * unique_ratio))


def relevance_score(text, mode):
    words = set(tokenize(text))
    keys = set(tokenize(' '.join(TECH_KEYWORDS.get(mode, []))))
    overlap = len(words & keys) / max(len(keys), 1)
    return max(0.0, min(1.0, overlap))


def similarity_score(text, reference):
    vec = TfidfVectorizer(stop_words='english')
    X = vec.fit_transform([text, reference])
    sim = cosine_similarity(X[0:1], X[1:2])[0][0]
    return float(sim)


REFERENCE = {
    'Technical': 'Polymorphism allows methods to do different things based on the object.',
    'Coding': 'Reverse a linked list by iterating and reassigning pointers.',
    'Aptitude': 'Probability of two heads in two fair coin tosses is one fourth.',
    'HR': 'Describe a challenge, actions taken, and measurable outcome.',
    'Reverse': 'Ask insightful questions about strategy, metrics, and customer value.',
    'Cultural': 'Respect diverse perspectives and encourage collaborative problem solving.'
}


def evaluate_text(text: str, mode: str):
    relevance = relevance_score(text, mode)
    similarity = similarity_score(text, REFERENCE.get(mode, '')) if text.strip() else 0.0
    grammar = grammar_score(text)
    clarity = clarity_score(text)
    
    # Calculate completeness based on length and content
    word_count = len(text.split())
    if word_count < 20:
        completeness = 0.4
    elif word_count < 50:
        completeness = 0.6
    elif word_count < 100:
        completeness = 0.8
    else:
        completeness = 0.95
    
    # Adjust completeness based on similarity (if answer matches reference well, it's more complete)
    completeness = min(1.0, completeness + similarity * 0.2)
    
    return {
        'relevance': relevance,
        'similarity': similarity,
        'grammar': grammar,
        'clarity': clarity,
        'completeness': completeness,
        'overall': float(max(0.0, min(1.0, 0.2*(relevance+similarity+grammar+clarity+completeness))))
    }
