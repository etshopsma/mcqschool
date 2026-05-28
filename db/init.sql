-- =============================================
-- MCQSchool Full Init (Fresh Setup)
-- Creates table + seeds sample questions
-- for Class 6, Class 8, Class 9 (Science), Class 10 (Science)
-- =============================================

CREATE TABLE IF NOT EXISTS questions (
    id             SERIAL  PRIMARY KEY,
    question       TEXT    NOT NULL,
    option1        TEXT    NOT NULL,
    option2        TEXT    NOT NULL,
    option3        TEXT    NOT NULL,
    option4        TEXT    NOT NULL,
    correct_answer TEXT    NOT NULL,
    class_level    INTEGER NOT NULL DEFAULT 1,
    branch         TEXT    DEFAULT NULL,
    subject        TEXT    NOT NULL DEFAULT 'General',
    chapter        TEXT    NOT NULL DEFAULT 'General',
    created_at     TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Class 6 | Mathematics | Chapter 1: Fractions
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('What is 1/2 + 1/4?',       '3/4','2/6','1/6','1/4',      '3/4',  6,NULL,'Mathematics','Chapter 1: Fractions'),
('What is 3/4 - 1/4?',       '1/2','1/4','2/4','3/8',      '1/2',  6,NULL,'Mathematics','Chapter 1: Fractions'),
('What is 2/3 × 3/4?',       '1/2','5/7','6/7','2/7',      '1/2',  6,NULL,'Mathematics','Chapter 1: Fractions'),
('Which fraction is largest?','3/4','1/2','2/3','1/4',      '3/4',  6,NULL,'Mathematics','Chapter 1: Fractions'),
('What is 5/5 simplified?',  '1',  '5',  '0',  '2',        '1',    6,NULL,'Mathematics','Chapter 1: Fractions');

-- =============================================
-- Class 6 | Mathematics | Chapter 2: Decimals
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('What is 0.5 + 0.25?',           '0.75','0.80','0.55','0.70','0.75',6,NULL,'Mathematics','Chapter 2: Decimals'),
('What is 1.5 × 2?',              '3.0', '2.5', '3.5', '4.0', '3.0', 6,NULL,'Mathematics','Chapter 2: Decimals'),
('Which is greater: 0.9 or 0.09?','0.9', '0.09','Equal','None','0.9', 6,NULL,'Mathematics','Chapter 2: Decimals');

-- =============================================
-- Class 6 | Science | Chapter 1: Living Things
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Which is a living thing?',       'Rock','Water','Plant','Sand',        'Plant',      6,NULL,'Science','Chapter 1: Living Things'),
('What do plants need to make food?','Sunlight','Moonlight','Fire','Wind','Sunlight',   6,NULL,'Science','Chapter 1: Living Things'),
('What gas do plants release?',    'Carbon Dioxide','Nitrogen','Oxygen','Hydrogen','Oxygen',6,NULL,'Science','Chapter 1: Living Things'),
('How do fish breathe?',           'Lungs','Gills','Skin','Nose',        'Gills',      6,NULL,'Science','Chapter 1: Living Things');

-- =============================================
-- Class 8 | Mathematics | Chapter 1: Algebra
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Solve: x + 5 = 12',     '6','7','8','9',     '7',8,NULL,'Mathematics','Chapter 1: Algebra Basics'),
('Simplify: 3x + 2x',     '5x','6x','x','4x',  '5x',8,NULL,'Mathematics','Chapter 1: Algebra Basics'),
('If y = 3, find 2y + 1', '7','8','6','9',      '7', 8,NULL,'Mathematics','Chapter 1: Algebra Basics'),
('Expand: 2(x + 3)',       '2x+6','2x+3','x+6','2x+5','2x+6',8,NULL,'Mathematics','Chapter 1: Algebra Basics'),
('Factor: x² - 9',         '(x+3)(x-3)','(x+9)(x-1)','(x-3)²','(x+3)²','(x+3)(x-3)',8,NULL,'Mathematics','Chapter 1: Algebra Basics');

-- =============================================
-- Class 8 | Science | Chapter 1: Atoms
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('What is the centre of an atom called?','Nucleus','Electron','Proton','Shell','Nucleus',8,NULL,'Science','Chapter 1: Atoms and Molecules'),
('Which particle has negative charge?',  'Proton','Neutron','Electron','Nucleus','Electron',8,NULL,'Science','Chapter 1: Atoms and Molecules'),
('What is the atomic number of Carbon?', '6','12','8','14','6',8,NULL,'Science','Chapter 1: Atoms and Molecules'),
('Atoms of the same element with different mass numbers are called?','Isotopes','Isobars','Ions','Molecules','Isotopes',8,NULL,'Science','Chapter 1: Atoms and Molecules');

-- =============================================
-- Class 9 | Science | Physics | Chapter 1: Motion
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('What is the SI unit of velocity?',    'm/s','km/h','m/s²','N',   'm/s',    9,'Science','Physics','Chapter 1: Motion'),
('Speed = Distance ÷ ?',               'Time','Mass','Force','Area','Time',   9,'Science','Physics','Chapter 1: Motion'),
('A body at rest has what velocity?',   '0','1','Infinite','Negative','0',    9,'Science','Physics','Chapter 1: Motion'),
('What is acceleration?',              'Rate of change of velocity','Rate of change of distance','Rate of change of mass','Rate of change of force','Rate of change of velocity',9,'Science','Physics','Chapter 1: Motion'),
('Unit of acceleration is?',           'm/s²','m/s','kg','N',      'm/s²',   9,'Science','Physics','Chapter 1: Motion');

-- =============================================
-- Class 9 | Science | Physics | Chapter 2: Force
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Force = Mass × ?',                 'Acceleration','Velocity','Speed','Distance','Acceleration',9,'Science','Physics','Chapter 2: Force and Laws of Motion'),
('SI unit of force is?',             'Newton','Joule','Watt','Pascal','Newton',9,'Science','Physics','Chapter 2: Force and Laws of Motion'),
('Newton''s first law is also called?','Law of Inertia','Law of Action','Law of Energy','Law of Gravity','Law of Inertia',9,'Science','Physics','Chapter 2: Force and Laws of Motion'),
('What force pulls objects to earth?','Gravity','Friction','Normal Force','Tension','Gravity',9,'Science','Physics','Chapter 2: Force and Laws of Motion');

-- =============================================
-- Class 9 | Science | Chemistry | Chapter 1: Matter
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Matter is anything that has mass and occupies?','Space','Time','Energy','Light','Space',9,'Science','Chemistry','Chapter 1: Matter in Our Surroundings'),
('Which state of matter has fixed shape?',        'Solid','Liquid','Gas','Plasma','Solid',9,'Science','Chemistry','Chapter 1: Matter in Our Surroundings'),
('Boiling is a change from?',                     'Liquid to Gas','Gas to Liquid','Solid to Liquid','Liquid to Solid','Liquid to Gas',9,'Science','Chemistry','Chapter 1: Matter in Our Surroundings'),
('What is the process of solid to gas directly?', 'Sublimation','Evaporation','Condensation','Fusion','Sublimation',9,'Science','Chemistry','Chapter 1: Matter in Our Surroundings');

-- =============================================
-- Class 9 | Science | Biology | Chapter 1: Cell
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Who discovered the cell?',               'Robert Hooke','Darwin','Pasteur','Newton','Robert Hooke',9,'Science','Biology','Chapter 1: The Fundamental Unit of Life'),
('The powerhouse of the cell is?',         'Mitochondria','Nucleus','Ribosome','Vacuole','Mitochondria',9,'Science','Biology','Chapter 1: The Fundamental Unit of Life'),
('Cell wall is present in?',               'Plant cells only','Animal cells only','Both','Neither','Plant cells only',9,'Science','Biology','Chapter 1: The Fundamental Unit of Life'),
('Which organelle controls cell activity?','Nucleus','Mitochondria','Ribosome','Lysosome','Nucleus',9,'Science','Biology','Chapter 1: The Fundamental Unit of Life'),
('What is the fluid inside the cell called?','Cytoplasm','Blood','Plasma','Sap','Cytoplasm',9,'Science','Biology','Chapter 1: The Fundamental Unit of Life');

-- =============================================
-- Class 9 | Humanities | Bangla | Chapter 1: Grammar
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('বাংলা ভাষার মৌলিক স্বরধ্বনি কয়টি?','৭','১১','৮','৯','১১',9,'Humanities','Bangla','Chapter 1: Bangla Grammar Basics'),
('বাংলা বর্ণমালায় ব্যঞ্জনবর্ণ কয়টি?','৩৯','৪০','৩৬','৩৫','৩৯',9,'Humanities','Bangla','Chapter 1: Bangla Grammar Basics');

-- =============================================
-- Class 9 | Business Studies | Accounting | Chapter 1
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Accounting equation is: Assets = Liabilities + ?','Capital','Revenue','Expense','Profit','Capital',9,'Business Studies','Accounting','Chapter 1: Introduction to Accounting'),
('Which account has a debit balance normally?',     'Asset','Liability','Capital','Revenue','Asset',9,'Business Studies','Accounting','Chapter 1: Introduction to Accounting'),
('Journal is also called?',                         'Book of original entry','Ledger','Balance Sheet','Trial Balance','Book of original entry',9,'Business Studies','Accounting','Chapter 1: Introduction to Accounting');

-- =============================================
-- Class 10 | Science | Physics | Chapter 1: Light
-- =============================================
INSERT INTO questions (question,option1,option2,option3,option4,correct_answer,class_level,branch,subject,chapter) VALUES
('Speed of light in vacuum is?',              '3×10⁸ m/s','3×10⁶ m/s','3×10¹⁰ m/s','3×10⁴ m/s','3×10⁸ m/s',10,'Science','Physics','Chapter 1: Light – Reflection and Refraction'),
('Angle of incidence equals angle of?',       'Reflection','Refraction','Absorption','Dispersion','Reflection',10,'Science','Physics','Chapter 1: Light – Reflection and Refraction'),
('A concave mirror is also called?',          'Converging mirror','Diverging mirror','Plane mirror','Convex mirror','Converging mirror',10,'Science','Physics','Chapter 1: Light – Reflection and Refraction'),
('The phenomenon of bending of light is?',    'Refraction','Reflection','Diffraction','Dispersion','Refraction',10,'Science','Physics','Chapter 1: Light – Reflection and Refraction'),
('Refractive index = Speed of light in vacuum / Speed in?','Medium','Air','Water','Glass','Medium',10,'Science','Physics','Chapter 1: Light – Reflection and Refraction');
