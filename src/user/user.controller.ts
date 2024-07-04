import { Controller, Get, Req, UseGuards ,Patch} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from 'src/auth/gaurd';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
    @UseGuards(JwtGaurd)//this route is protected by jwt strategy
    @Get('me')
    getMe(@GetUser() user: User) {
        return user
    }

    @Patch() 
    editUser() {}
}


