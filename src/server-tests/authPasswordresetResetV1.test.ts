// @ts-nocheck
import { expect } from '@jest/globals';

import { POST, BODY, DELETE } from './httpRequestsV1';
import {clearPATH, authPasswordresetResetPATH } from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;

// STANDARD INPUTS
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const PASSWORD_VALID = 'password';
const PASSWORD_INVALID = '';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const resetCode_INVALID = '';



// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('error return type', () => {
    test('resetCode is not a valid reset code', () => {

        const result= POST(authPasswordresetResetPATH, {
            resetCode:resetCode_INVALID,
            newPassword: PASSWORD_VALID,
          });

        expect(result.statusCode).toBe(BAD_REQUEST);
    });

/*    test('password entered is less than 6 characters long', () => {
        const register = POST(authRegisterPATH, {
            email: EMAIL_VALID,
            password: PASSWORD_VALID,
            nameFirst: FIRSTNAME_VALID,
            nameLast: LASTNAME_VALID
          });

        const logout = POST(authLogoutPATH, {
            token: BODY(register).token,
          });
      
        const resetCode= POST(authPasswordResetRequestPATH, {
            email: EMAIL_VALID,
          });

        const result= POST(authPasswordresetResetPATH, {
            resetCode: BODY(resetCode),
            newPassword: PASSWORD_INVALID,
          });

        expect(result.statusCode).toBe(BAD_REQUEST);
    });
    */
});

/*
describe('general return type', () => {
    test('correct return type', () => {

        const register = POST(authRegisterPATH, {
            email: EMAIL_VALID,
            password: PASSWORD_VALID,
            nameFirst: FIRSTNAME_VALID,
            nameLast: LASTNAME_VALID
          });

        const logout = POST(authLogoutPATH, {
            token: BODY(register).token,
          });
      
        const resetCode= POST(authPasswordResetRequestPATH, {
            email: EMAIL_VALID,
          });
        
          const result= POST(authPasswordresetResetPATH, {
            resetCode: BODY(resetCode),
            newPassword: PASSWORD_VALID,
          });
    
    expect(result.statusCode).toBe(OK);
    expect (BODY(result)).toStrictEqual({});
    });
});  
*/