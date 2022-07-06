import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { environment } from '@environments/environment';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    entries = null;
    constructor(private accountService: AccountService) {}
    apiUrl = environment.apiUrl

    ngOnInit() {
        this.entries = this.accountService.getAll()    
        .pipe(first())
        .subscribe(entries => this.entries = entries);
    }

    deleteEntrie(id: string) {
        const entrie = this.entries.find(x => x.id === id);
        entrie.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => this.entries = this.entries.filter(x => x.id !== id));
    }
}