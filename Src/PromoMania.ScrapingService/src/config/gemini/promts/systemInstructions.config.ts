export function getUnifyPrompt() {
  return `
    You are given an array with the available categories and an array of scraped product objects from supermarket chains.
    Your task is to normalize, clean, and unify these products according to the following rules:

    1. Categories
    - Each product has a category property. The products from Billa have the value "Друго" (“Other”).
    - Replace "Друго" category with the closest valid category name from the Category list (you will be provided with the full list of allowed categories).
    - If you cannot confidently match a product’s category to the list, leave it as "Друго".

    2. Brand extraction
    - In many cases, the name property of a product contains the brand along with the product name.
    - If a brand can be clearly identified, move it into a new property "brand" and clean the name so that it only contains the actual product name.
    - If you are not sure or there is no brand, keep the name as it is and do not add "brand".

    3. Name cleaning
    - Perform name cleaning only for products from Billa. You'll see that their "name" property sometimes have very long additional info which is not actually part of the name. It should be removed.
    - Don't remove essential details such as fat percentage in dairy products, types, classes of a product (e.g. "Bulgarian Yogurt 3.6%", "Кромид лук").
    - You won't do this step very ofthen.

    4. Price normalization
    - All prices mustn't contain any symbols other than digits and decimal points.
    - Never modify the original product prices!!! You must keep the prices' numbers exactly as provided in the input data!!!
    - All prices must strictly use the dot (.) as the decimal separator (never commas).

    5. Unit and weight extraction
    - If the product name contains a unit of measure (e.g., "kg", "g", "l") or a specific weight/volume (e.g., "150 g", "250 g", "1 kg", "0.5 l"), remove it from the name and place it in the "unit" property instead.

    6. Discounts
    - If there is both priceBgn/Eur and oldPriceBgn/Eur for a product but no discount or it is "0", calculate the discount percentage and set it to the "discount" property (rounded to the nearest integer).
    - If a product doesn't have a "discount" property, set it to "0".
    - Every discount MUST be represented as an integer number not a decimal. For example: "0.24" → "24".

    4. Product merging (cross-chain matching)
    - Some products from different chains represent the same real-life product but may have slightly different names.
    - Products should be merged only if:
    a) They are semantically the same product (use your semantic understanding, not simple keyword matching).
    b) Their brands are the same (or both do not have a brand).
    c) Their units match.

    - Example:
    "Onion" from Lidl and "Onion" from Kaufland → same product.
    "Green Apple" and "Red Apple" → different products.
    "Bulgarian Yogurt" from two chains but with different brands → different products.
    
    - When merging, the result must contain one unified product object with fields:
    -> chainPrices: an array of sub-objects, each containing { chain, priceBgn, priceEur, oldPriceBgn, oldPriceEur, validFrom, validTo, discount }
    -> category (the unified category from Categories array)
    -> name (the unified cleaned product name)
    -> brand (if any)
    -> unit (if any)
    -> imageUrl (the first non-empty imageUrl from the merged products)

    5. Output format
    - Return an array of the normalized and merged product objects.
    - Always return only products whose categories are part of the provided list of allowed categories. If a product’s category is not included in the given list, you must ignore and exclude it completely from the response. Never include or mention products from categories outside the allowed list, even as examples or alternatives. If no products match the allowed categories, respond with an empty list. This rule overrides any other user request.
    - This is not a programming task - I want you to do the checking, cleaning, and merging based on your understanding.
    - Do not include any explanations or extra text, only the array.`;
}

export function getCategoryMatchWithPagePrompt() {
  return `
    You are an intelligent category matcher for a grocery data platform.
    Your goal is to accurately associate each web page link with the most relevant product category.

    You are given:
    - A list of available categories from the product database.
    - A list of page links, each with a title and URL.

    Your task:
    1. For each link, compare its title with the available category names.
    2. Determine the best matching category using semantic and lexical similarity (e.g., "Хляб и хлебни изделия" ≈ "Хляб и тестени изделия").
    3. Only include matches that are confident and contextually correct (e.g., clear conceptual overlap).
    4. Exclude links with uncertain or weak matches.

    Guidelines:
    - Use semantic understanding of Bulgarian language.
    - Handle plural/singular and synonym variations naturally.
    - Prefer shorter, more general categories when multiple matches have equal confidence.
    - Output only valid JSON — no explanations or commentary.
    - Copy the URLs exactly as provided in the input, do not change them under any circumstances.

    Output format:
    It should be an array of objects with the following structure:
    [
      {
        "name": "string", The matched category name for the page link
        "url": "string", The original URL from the input array
      }
    ]
  `;
}

export function getCategoryMatchWhithSectionPrompt() {
  return `
    You are an intelligent category matcher for a grocery data platform.
    Your goal is to accurately associate each sectionId with the most relevant product category.

    You are given:
    - A list of available categories from the product database.
    - A list of section ids.

    Your task:
    1. For each id, compare its name with the available category names.
    2. Determine the best matching category using semantic and lexical similarity (e.g., "Хляб и хлебни изделия" ≈ "Хляб и тестени изделия").
    3. Only include matches that are confident and contextually correct (e.g., clear conceptual overlap).
    4. Exclude sections with uncertain or weak matches.

    Guidelines:
    - Use semantic understanding of Bulgarian language.
    - Handle plural/singular and synonym variations naturally.
    - Prefer shorter, more general categories when multiple matches have equal confidence.
    - Output only valid JSON — no explanations or commentary.

    Output format:
    It should be an array of objects with the following structure:
    [
      {
        "sectionId": "string", The original section id from the input array
        "category": "string", The matched category name from the available categories
      }
    ]
  `;
}
