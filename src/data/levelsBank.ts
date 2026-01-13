export type Task = {
  id: string;
  title: string; 
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export type Level = {
  level: number;
  header: string;
  tasks: Task[];
};

export const LEVELS: Level[] = [
  {
    level: 1,
    header: 'Level 1',
    tasks: [
      {
        id: '1-1',
        title: 'Logic Task 1',
        question: '8 + 6 ÷ 3 = ?',
        options: ['6', '10', '12', '14'],
        correctIndex: 1,
      },
      {
        id: '1-2',
        title: 'Logic Task 2',
        question: '12 − 6 ÷ 3 = ?',
        options: ['10', '2', '4', '6'],
        correctIndex: 0,
      },
      {
        id: '1-3',
        title: 'Logic Task 3',
        question: '4 × 3 + 6 ÷ 2 = ?',
        options: ['9', '12', '15', '18'],
        correctIndex: 2,
      },
      {
        id: '1-4',
        title: 'Logic Task 4',
        question: '18 ÷ 3 + 4 × 2 = ?',
        options: ['10', '14', '16', '18'],
        correctIndex: 1,
      },
    ],
  },

  {
    level: 2,
    header: 'Level 2 — Logic Tasks',
    tasks: [
      {
        id: '2-1',
        title: 'Logic Task 1',
        question: '2   4   8   16   ?',
        options: ['18', '32', '24', '30'],
        correctIndex: 1,
      },
      {
        id: '2-2',
        title: 'Logic Task 2',
        question: '1   4   9   16   ?',
        options: ['20', '25', '24', '18'],
        correctIndex: 1,
      },
      {
        id: '2-3',
        title: 'Logic Task 3',
        question: '3   6   12   24   ?',
        options: ['36', '40', '48', '30'],
        correctIndex: 2,
      },
      {
        id: '2-4',
        title: 'Logic Task 4',
        question: '5   10   20   40   ?',
        options: ['60', '80', '70', '90'],
        correctIndex: 1,
      },
    ],
  },

  {
    level: 3,
    header: 'Level 3 — Logic Traps',
    tasks: [
      {
        id: '3-1',
        title: 'Logic Task 1',
        question:
          'A bat and a ball cost $1.10 in total.\nThe bat costs $1.00 more than the ball.\nHow much does the ball cost?',
        options: ['$0.05', '$0.10', '$0.15', '$0.20'],
        correctIndex: 0,
      },
      {
        id: '3-2',
        title: 'Logic Task 2',
        question:
          'If it takes 5 machines 5 minutes to make 5 items,\nhow long would it take 100 machines to make 100 items?',
        options: ['100 minutes', '50 minutes', '10 minutes', '5 minutes'],
        correctIndex: 3,
      },
      {
        id: '3-3',
        title: 'Logic Task 3',
        question: 'How many times can you subtract 10 from 100?',
        options: ['10', '9', '1', '0'],
        correctIndex: 2,
      },
      {
        id: '3-4',
        title: 'Logic Task 4',
        question:
          'A lily pad patch doubles in size every day.\nIt takes 48 days to cover the whole lake.\nOn what day is the lake half covered?',
        options: ['24', '46', '47', '48'],
        correctIndex: 2,
      },
    ],
  },

  ...Array.from({ length: 27 }, (_, i) => {
    const lvl = i + 4;
    const seq1 = (n: number) => ({
      id: `${n}-1`,
      title: 'Logic Task 1',
      question: `Sequence: ${n}  ${n * 2}  ${n * 4}  ${n * 8}  ?`,
      options: [
        String(n * 10),
        String(n * 12),
        String(n * 16),
        String(n * 14),
      ] as any,
      correctIndex: 2 as 0 | 1 | 2 | 3,
    });

    const seq2 = (n: number) => ({
      id: `${n}-2`,
      title: 'Logic Task 2',
      question: `Sequence: 1  3  6  10  15  ?`,
      options: ['18', '20', '21', '22'] as any,
      correctIndex: 2 as 0 | 1 | 2 | 3, // 21
    });

    const ar1 = (n: number) => {
      const a = (n % 9) + 6; 
      const b = (n % 4) + 2; 
      const c = (n % 5) + 2; 
      const cc = [2, 3, 4, 6][n % 4];
      const value = a * b - 12 / cc;
      const opts = [
        value - 2,
        value,
        value + 2,
        value + 4,
      ].map(x => String(Math.round(x)));
      return {
        id: `${n}-3`,
        title: 'Logic Task 3',
        question: `${a} × ${b} − 12 ÷ ${cc} = ?`,
        options: [opts[0], opts[1], opts[2], opts[3]] as any,
        correctIndex: 1 as 0 | 1 | 2 | 3,
      };
    };

    const logic = (n: number) => {
   
      const variants: Array<Task> = [
        {
          id: `${n}-4`,
          title: 'Logic Task 4',
          question:
            'You have three switches outside a closed room.\nOnly one switch controls the lamp inside.\nHow many times do you need to enter the room to be sure?',
          options: ['1', '2', '3', '0'],
          correctIndex: 1,
        },
        {
          id: `${n}-4`,
          title: 'Logic Task 4',
          question:
            'A clock shows 3:15.\nWhat is the angle between the hour and minute hands?',
          options: ['0°', '7.5°', '15°', '30°'],
          correctIndex: 1,
        },
        {
          id: `${n}-4`,
          title: 'Logic Task 4',
          question:
            'If 2 pencils cost 8 coins,\nhow many coins do 5 pencils cost?',
          options: ['16', '18', '20', '24'],
          correctIndex: 2,
        },
        {
          id: `${n}-4`,
          title: 'Logic Task 4',
          question:
            'A rectangle has perimeter 30.\nIf one side is 8, what is the other side?',
          options: ['6', '7', '8', '9'],
          correctIndex: 3, 
        },
      ];

      const pick = variants[n % variants.length];
      if (pick.question.startsWith('A rectangle')) {
        return {
          ...pick,
          options: ['6', '7', '8', '9'],
          correctIndex: 1,
        };
      }

      return pick;
    };

    return {
      level: lvl,
      header: `Level ${lvl}`,
      tasks: [seq1(lvl), seq2(lvl), ar1(lvl), logic(lvl)],
    } as Level;
  }),
];

export function getLevel(level: number): Level {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}
