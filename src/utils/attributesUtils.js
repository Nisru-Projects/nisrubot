module.exports = {
    mergeAttributes: (attributes = []) => {
        const mergedAttributes = attributes.reduce((acc, cur) => {
            if (!cur) return acc
            for (const [key, value] of Object.entries(cur)) {
                if (acc[key] !== undefined) {
                    acc[key] += value;
                } else {
                    acc[key] = value;
                }
            }
            return acc;
        }, {});

        return mergedAttributes;
    }
}