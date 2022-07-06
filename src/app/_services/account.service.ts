import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { Entrie } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(userName, password) {
        return this.http.post<User>(`${environment.apiUrl}authenticate`, { userName, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(entrie: Entrie, imgFile: any) {
        let  info = encodeURI(JSON.stringify({date:entrie.date, text:entrie.text, number:entrie.number}));
        var file = imgFile;
        var formData = new FormData();
        formData.append('image', file);
        formData.append('info', info);
        return this.http.post(`${environment.apiUrl}data`, formData);
    }

    getAll() {
        return this.http.get<Entrie[]>(`${environment.apiUrl}data/getAllData`);
    }

    getById(id: string) {

        let entrie = this.http.get<Entrie>(`${environment.apiUrl}data/${id}`)

        console.log(entrie);
        return entrie;
    }

    public url;
    update(id, params, imgFile: any) {
        
        let  info = encodeURI(JSON.stringify({date:params.date, text:params.text, number:params.number}));
        var file = imgFile;
        var formData = new FormData();
        formData.append('image', file);
        formData.append('info', info);
        return this.http.post(`${environment.apiUrl}data/${id}`, formData)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}data/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}