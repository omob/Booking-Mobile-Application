import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Place } from './../../places/place.model';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';

  @ViewChild('f') form: NgForm;

  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);

    if (this.selectedMode === 'random') {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 60 * 1000 -
                availableFrom.getTime())
      ).toISOString();

      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() * (
            new Date(this.startDate).getTime()
            + 6 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime())
      ).toISOString();
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onBookPlace() {
    if (!this.form.valid || !this.datesValid()){
      return;
    }

    this.modalCtrl.dismiss(
      {
        bookingData: {
          firstName: this.form.value.firstName,
          lastName: this.form.value.lastName,
          guestNumber: this.form.value.guestNumber,
          startDate: this.form.value.dateFrom,
          endDate: this.form.value.dateTo
        }
      }, 'confirm');
  }

  datesValid() {
    const startDate = new Date(this.form.value['dateFrom']);
    const endDate = new Date(this.form.value['dateTo']);

    return endDate > startDate;
  }
}
