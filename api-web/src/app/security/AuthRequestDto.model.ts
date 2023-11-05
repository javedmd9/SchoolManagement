import { Privilege } from "../teachers/teacher.model";

export class AuthRequestDto {

    constructor(
        public username: string,
        public password: string,
        public _token?: string,
        public tokenExpiry?: Date,
        public roles?: Roles,
        public privilegeList?: Privilege[]
    ) { }

    get token(){
        if(!this.tokenExpiry || new Date > this.tokenExpiry){
            return null;
        }
        return this._token;
    }

}

export class Roles{
    id?: number;
    name?: string;
    constructor(){}
}