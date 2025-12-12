import { handleError } from '../../utils/errorHandler';
import { describe, it, expect } from 'vitest';

describe('errorHandler', () => {
    it('should handle string errors', () => {
        const result = handleError("Simple error");
        expect(result.message).toBe("Simple error");
    });

    it('should handle Error objects', () => {
        const error = new Error("System failure");
        const result = handleError(error);
        expect(result.message).toBe("System failure");
    });

    it('should handle unknown objects', () => {
        const result = handleError({ code: 500 });
        expect(result.message).toBe("Ocurrió un error inesperado");
        expect(result.description).toContain('{"code":500}');
    });
});
