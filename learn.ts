import { Response, Request } from "express";
import { LoginDto } from "src/models/auth/dto/login-dto";

async function login(loginDto: LoginDto, response: Response, request: Request) {
    if (!loginDto.password || !loginDto.email)
      return response
        .status(401)
        .json({ success: false, message: 'incomplete credentials' });

    // destructuring loginDTO
    const { email = '', password, rememberMe } = loginDto;

    try {
      // call the validateUser function
      const result = await this.validateUser(email, password);

      // check if result contains the data payload
      if (!result?.data?.isValid) {
        return response.status(401).json({
          success: false,
          message: 'invalid credentials',
        });
      }
      const { id, roles } = result?.data as {
        isValid: boolean;
        id: string;
        roles: string[];
      };
      // process login if user validation was successfull

      const fingerprint = await this.generateFingerprint(request);

      const sessionTTL = rememberMe
        ? 7 * 24 * 60 * 60 * 1000
        : 1 * 60 * 60 * 1000;

      request.session.user = {
        id,
        roles,
        fingerprint,
      };

      request.session.cookie.maxAge = sessionTTL;

      // send login-alert email
      return response
        .status(200)
        .json({ success: true, message: 'login successful' });
    } catch (error) {
      this.logger.error(`Error finding user in db`, error);
      return response
        .status(500)
        .json({ success: false, message: 'error validating user' });
    }
  }