export interface RawData {
  country: string;
  airline: string;
  abbreviation: string;
}

export interface Question {
  country: string;
  options: string[];
  correctAnswerIndex: number;
}

// Function to shuffle an array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateQuestions(data: RawData[], count: number = 10): Question[] {
  const questions: Question[] = [];
  
  // Create a pool of indices and shuffle to pick random distinct countries for questions
  const indices = Array.from({ length: data.length }, (_, i) => i);
  const selectedIndices = shuffleArray(indices).slice(0, Math.min(count, data.length));

  for (const index of selectedIndices) {
    const target = data[index];
    
    // Pick 3 random wrong airlines
    const otherAirlines = data
      .filter((_, i) => i !== index)
      .map(d => d.airline);
    
    const wrongOptions = shuffleArray(otherAirlines).slice(0, 3);
    
    const allOptions = [...wrongOptions, target.airline];
    const shuffledOptions = shuffleArray(allOptions);
    
    questions.push({
      country: target.country,
      options: shuffledOptions,
      correctAnswerIndex: shuffledOptions.indexOf(target.airline)
    });
  }

  return questions;
}
