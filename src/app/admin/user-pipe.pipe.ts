import { Pipe, PipeTransform } from '@angular/core';
import { IMeasurement } from 'src/models/measurement.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';

@Pipe({
  name: 'userPipe',
})
/**
 * Transforms a user ID to the corresponding user name.
 */
export class UserPipePipe implements PipeTransform {
  users: User[] = [];

  /**
   * Constructs a new instance of the UserPipePipe class.
   * @param userService The user service used to retrieve the user list.
   */
  constructor(private userService: UserService) {
    userService.userListObservable?.subscribe((data) => {
      this.users = data;
    });
  }

  /**
   * Transforms the user ID to the corresponding user name.
   * @param id The user ID to transform.
   * @returns The user name associated with the given ID, or an empty string if no matching user is found.
   */
  transform(id: string): string {
    const user = this.users.find((u) => u.UserId === id);
    if (user) {
      return user.Name;
    }
    return '';
  }
}

@Pipe({
  name: 'measurementPipe',
})
export class MeasurementPipePipe implements PipeTransform {
  transform(measurements: IMeasurement[], query: string): IMeasurement[] {
    if (!measurements) return [];
    if (!query) return measurements;
    return measurements.filter((m) =>
      m.Name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
