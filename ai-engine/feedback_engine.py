def generate_feedback(nlp: dict, emotion: dict, decision: dict, mode: str) -> str:
    suggestions = []
    if nlp.get('relevance',0) < 0.6:
        suggestions.append('Improve topic focus: reference key concepts for the question.')
    if nlp.get('clarity',0) < 0.6:
        suggestions.append('Simplify sentences and structure your thoughts clearly.')
    if nlp.get('grammar',0) < 0.6:
        suggestions.append('Mind punctuation and grammar consistency.')
    emo_label = emotion.get('label','Neutral')
    if emo_label == 'Nervous':
        suggestions.append('Slow down slightly, breathe between thoughts to reduce nervousness.')
    if emo_label == 'Confident' and emotion.get('confidence',0)<0.7:
        suggestions.append('Project voice a bit more to strengthen confidence.')
    if mode == 'Coding':
        suggestions.append('Explain algorithm steps and complexity tradeoffs clearly.')
    if mode == 'HR':
        suggestions.append('Use STAR method: Situation, Task, Action, Result.')
    if not suggestions:
        suggestions.append('Great job! Keep refining with more practice questions.')
    return ' '.join(suggestions)
