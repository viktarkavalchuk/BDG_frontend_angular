import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { environment } from '@environments/environment';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    imgFile: any; 
	msg = "";
    imageURL: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        console.log()
        this.form = this.formBuilder.group({
            date: new Date().toISOString().slice(0, 10),
            number: '',
            text: '',            
            image: ''
        });

        if (!this.isAddMode) {
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => this.func(x));
        }
    }

    func(x: any){
        this.form.patchValue({'text':x.text});
        this.form.patchValue({'number':x.number});   
        let dateStr = new Date(x.date + 60*60*4*1000).toISOString().slice(0, 10);
        this.form.patchValue({'date':dateStr});
        this.imageURL = environment.apiUrl + x.image;
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
    
    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createEntrie();
        } else {
            this.updateEntrie();
        }
    }

    private createEntrie() {        
        this.accountService.register(this.form.value, this.imgFile)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Entrie added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateEntrie() {
        this.accountService.update(this.id, this.form.value, this.imgFile)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }


    public selectFile(event: any){

        console.log("In select file");

        if (!event.target.files[0] || event.target.files[0].length == 0) {
            this.msg = 'You must select an image';
            return;
        }

        var mimeType = event.target.files[0].type;

        if (mimeType.match(/image\/*/) == null) {
            this.msg = "Only images are supported";
            return;
        }

        this.imgFile = event.target.files[0];
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            this.imageURL = reader.result as string;
        }
        reader.readAsDataURL(file)
    }
}