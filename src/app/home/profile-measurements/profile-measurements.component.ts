import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMeasurement } from 'src/models/measurement.model';
import { OtherInfo } from 'src/models/other-info.model';
import { MeasurementsService } from 'src/services/measurements.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';
import { BaseProfileComponent } from '../BaseProfileComponent';

@Component({
  selector: 'app-profile-measurements',
  templateUrl: './profile-measurements.component.html',
  styleUrls: ['./profile-measurements.component.scss'],
})
export class ProfileMeasurementsComponent
  extends BaseProfileComponent
  implements OnInit
{
  systemMeasurements?: OtherInfo<IMeasurement[]>;

  constructor(
    userService: UserService,
    router: Router,
    uxService: UxService,
    private measurementsService: MeasurementsService
  ) {
    super(userService, router, uxService);
    this.getSystemMeasurements();
  }

  ngOnInit(): void {}

  getSystemMeasurements() {
    const id = '80edddf9-6fc0-11eb-9698-12911df8ace9';
    this.measurementsService.measurements(id).subscribe((data) => {
      if (data && data.length && this.user && data[0].ItemValue) {
        this.systemMeasurements = data[0];
        this.mapUserMeasurements();
      }
    });
  }
  mapUserMeasurements() {
    if (!this.user || !this.systemMeasurements) return;
    if (
      !this.user.Measurements ||
      !Array.isArray(this.user.Measurements) ||
      !this.user.Measurements.length
    )
      this.user.Measurements = [];

    //Map
    this.systemMeasurements.ItemValue.forEach((systemM) => {
      const userM = this.user?.Measurements.find(
        (x) => x.Name === systemM.Name
      );
      if (!userM) {
        this.user?.Measurements.push({
          Name: systemM.Name,
          Value: '',
          Units: 'Cm',
          Image: '',
        });
      }
    });

    //Sort
    this.user.Measurements = this.user.Measurements.sort((a, b) => {
      return a.Name.localeCompare(b.Name);
    });

    // Delete all that do not exist in the system measurements
    if (
      this.user.Measurements.length > this.systemMeasurements.ItemValue.length
    ) {
      this.user.Measurements = this.user.Measurements.filter((m) =>
        this.systemMeasurements?.ItemValue.find((sm) => sm.Name === m.Name)
      );
      this.userService.updateUserState(this.user);
      this.userService.save(this.user).subscribe();
    }
  }
}
