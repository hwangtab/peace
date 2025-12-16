# 코드 리뷰: 캠프 페이지 내 '참여 뮤지션' 섹션 제목 불균형 문제

## 1. 개요

`Camp2023Page.tsx` 및 `Camp2025Page.tsx` 파일에서 '참여 뮤지션' 섹션의 제목이 `h3` 태그로 지정되어 있어, 다른 섹션 제목 (`행사 개요`)과 비교했을 때 시각적인 불균형이 발생하고 있습니다. 사용자 요청에 따라 이 제목을 `h2` 수준으로 조정하여 페이지 내 제목 계층의 일관성을 확보하고자 합니다.

## 2. 문제 원인 분석

`Camp2023Page.tsx`와 `Camp2025Page.tsx` 두 파일 모두에서 '참여 뮤지션' 섹션의 제목은 다음과 같이 `h3` 태그와 `typo-h3` Tailwind CSS 클래스를 사용하여 렌더링되고 있습니다.

```tsx
<h3 className="typo-h3 mb-6">
  참여 뮤지션
</h3>
```

바로 위에 있는 '행사 개요' 섹션의 제목은 `h2` 태그와 `typo-h2` 클래스를 사용하고 있어, `h2` 제목과 `h3` 제목 사이에 시각적인 위계 차이가 발생합니다.

```tsx
<h2 className="typo-h2 mb-6">
  행사 개요
</h2>
```

## 3. 관련 파일

*   `src/pages/Camp2023Page.tsx`
*   `src/pages/Camp2025Page.tsx`

## 4. 해결 방안 (Proposed Solution)

'참여 뮤지션' 섹션 제목에 `h2` 태그와 `typo-h2` 클래스를 적용하여 '행사 개요' 섹션 제목과 동일한 시각적 중요도를 갖도록 수정합니다.

### 4.1. `src/pages/Camp2023Page.tsx` 수정

'참여 뮤지션' 섹션의 `h3` 태그를 `h2` 태그로 변경하고, `className`을 `typo-h2`로 변경합니다.

**변경 전:**

```tsx
            {/* Participants Section */}
            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <h3 className="typo-h3 mb-6">
                  참여 뮤지션
                </h3>
                {/* ... (이하 동일) ... */}
              </motion.div>
            )}
```

**변경 후:**

```tsx
            {/* Participants Section */}
            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <h2 className="typo-h2 mb-6"> {/* h3 -> h2, typo-h3 -> typo-h2 */}
                  참여 뮤지션
                </h2>
                {/* ... (이하 동일) ... */}
              </motion.div>
            )}
```

### 4.2. `src/pages/Camp2025Page.tsx` 수정

`Camp2023Page.tsx`와 동일하게 '참여 뮤지션' 섹션의 `h3` 태그를 `h2` 태그로 변경하고 `className`을 `typo-h2`로 변경합니다.

**변경 전:**

```tsx
            {/* Participants Section */}
            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <h3 className="typo-h3 mb-6">
                  참여 뮤지션
                </h3>
                {/* ... (이하 동일) ... */}
              </motion.div>
            )}
```

**변경 후:**

```tsx
            {/* Participants Section */}
            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <h2 className="typo-h2 mb-6"> {/* h3 -> h2, typo-h3 -> typo-h2 */}
                  참여 뮤지션
                </h2>
                {/* ... (이하 동일) ... */}
              </motion.div>
            )}
```

## 5. 기대 효과

*   '참여 뮤지션' 섹션 제목의 시각적 중요도가 '행사 개요'와 동일하게 조정되어 페이지 내 제목 계층의 일관성이 확보됩니다.
*   전반적인 페이지 디자인의 균형감이 향상됩니다.
