class BusinessError extends Error {
    constructor(message, status = 400, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

module.exports = BusinessError;
