import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseFormPayloadJsonPipe implements PipeTransform {
  transform(value: any) {
    console.log(value);
    if (value) {
      value = JSON.parse(value);
    }
    return value;
  }
}
