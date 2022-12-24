module.exports = {
    mergeAttributes: (attributes1 = {}, attributes2 = {}) => {
        for (const [key, value] of Object.entries(attributes2)) {
            if (attributes1[key] !== undefined) {
                attributes1[key] += value;
            } else {
                attributes1[key] = value;
            }
        }
        return attributes1;
    }
}