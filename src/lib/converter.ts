type Rule = {
  from: string;
  to: string;
};

/**
 * Replaces characters in the given string according to the specified rules.
 * @param rules - Array of transformation rules (from -> to).
 * @param output - The input string to apply the transformations to.
 * @returns The transformed string.
 */
function replaceWithRule(rules: Rule[], output: string): string {
  return rules.reduce((result, { from, to }) => {
    const fromRegex = new RegExp(
      from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    return result.replace(fromRegex, to);
  }, output);
}

/**
 * Converts the input string to Unicode using predefined transformation rules.
 * @param output - The input string to transform.
 * @returns The transformed Unicode string.
 */
export function getLisuChar(output: string): string {
  console.log("getLisuChar", output);

  const rules: Rule[] = [
    { from: "a", to: "ꓮ" },
    { from: "A", to: "ꓯ" },
    { from: "b", to: "ꓐ" },
    { from: "B", to: "ꓭ" },
    { from: "c", to: "ꓚ" },
    { from: "C", to: "ꓛ" },
    { from: "d", to: "ꓓ" },
    { from: "D", to: "ꓷ" },
    { from: "e", to: "ꓰ" },
    { from: "E", to: "ꓱ" },
    { from: "f", to: "ꓝ" },
    { from: "F", to: "ꓞ" },
    { from: "g", to: "ꓖ" },
    { from: "G", to: "ꓨ" },
    { from: "h", to: "ꓧ" },
    { from: "i", to: "ꓲ" },
    { from: "I", to: "꓾" },
    { from: "j", to: "ꓙ" },
    { from: "J", to: "ꓩ" },
    { from: "k", to: "ꓗ" },
    { from: "K", to: "ꓘ" },
    { from: "l", to: "ꓡ" },
    { from: "L", to: "ꓶ" },
    { from: "m", to: "ꓟ" },
    { from: "n", to: "ꓠ" },
    { from: "o", to: "ꓳ" },
    { from: "O", to: "ˍ" },
    { from: "p", to: "ꓑ" },
    { from: "P", to: "ꓒ" },
    { from: "r", to: "ꓣ" },
    { from: "R", to: "ꓤ" },
    { from: "s", to: "ꓢ" },
    { from: "t", to: "ꓔ" },
    { from: "T", to: "ꓕ" },
    { from: "u", to: "ꓴ" },
    { from: "U", to: "ꓵ" },
    { from: "v", to: "ꓦ" },
    { from: "V", to: "ꓥ" },
    { from: "w", to: "ꓪ" },
    { from: "x", to: "ꓫ" },
    { from: "y", to: "ꓬ" },
    { from: "z", to: "ꓜ" },
    { from: ",", to: "ꓹ" },
    { from: "H", to: "ꓺ" },
    { from: "Y", to: "ꓻ" },
    { from: ";", to: "ꓼ" },
    { from: ":", to: "ꓽ" },
    { from: "=", to: "꓿" },
    { from: " ", to: " " },
    { from: "S", to: "ꓸꓼ" },
    { from: "W", to: "ꓹꓼ" },
    { from: ".", to: "ꓸ" },
  ];
  return replaceWithRule(rules, output);
}
