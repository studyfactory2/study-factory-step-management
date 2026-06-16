UPDATE member
SET
  birth_date = CASE
    WHEN name = '김지원' THEN DATE '1985-07-13'
    WHEN name = '김태환' THEN DATE '1999-12-02'
    WHEN id = 1 THEN DATE '1987-03-21'
    WHEN id = 3 THEN DATE '1990-05-08'
    WHEN id = 4 THEN DATE '1994-11-17'
    WHEN id = 5 THEN DATE '1991-02-26'
    WHEN id = 6 THEN DATE '1996-08-14'
    WHEN id = 7 THEN DATE '1998-01-09'
    WHEN id = 8 THEN DATE '1993-06-30'
    WHEN id = 9 THEN DATE '1995-09-22'
    WHEN id = 10 THEN DATE '1989-12-05'
    WHEN id = 11 THEN DATE '1997-04-19'
    WHEN id = 12 THEN DATE '2000-10-11'
    WHEN id = 13 THEN DATE '1992-07-04'
    WHEN id = 14 THEN DATE '1996-03-16'
    WHEN id = 15 THEN DATE '1988-11-28'
    WHEN id = 17 THEN DATE '1994-05-23'
    ELSE birth_date
  END,
  residence_city = CASE
    WHEN name = '김지원' THEN '부산광역시'
    WHEN name = '김태환' THEN '부산광역시'
    WHEN id IN (1, 5, 9, 13, 17) THEN '부산광역시'
    WHEN id IN (3, 7, 11, 15) THEN '서울특별시'
    WHEN id IN (4, 8, 12) THEN '대구광역시'
    WHEN id IN (6, 10, 14) THEN '인천광역시'
    ELSE COALESCE(residence_city, '부산광역시')
  END,
  residence_district = CASE
    WHEN name = '김지원' THEN '남구'
    WHEN name = '김태환' THEN '사상구'
    WHEN id = 1 THEN '해운대구'
    WHEN id = 3 THEN '강남구'
    WHEN id = 4 THEN '수성구'
    WHEN id = 5 THEN '동래구'
    WHEN id = 6 THEN '연수구'
    WHEN id = 7 THEN '마포구'
    WHEN id = 8 THEN '달서구'
    WHEN id = 9 THEN '수영구'
    WHEN id = 10 THEN '부평구'
    WHEN id = 11 THEN '송파구'
    WHEN id = 12 THEN '중구'
    WHEN id = 13 THEN '부산진구'
    WHEN id = 14 THEN '남동구'
    WHEN id = 15 THEN '서초구'
    WHEN id = 17 THEN '금정구'
    ELSE COALESCE(residence_district, '남구')
  END;
