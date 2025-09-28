import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}
  async bookAppointment(bookAppointmentDto: BookAppointmentDto) {
    // extract args
    const { status, dateTime, doctorId, patientId } = bookAppointmentDto;

    /**
     * const event = new Date();
      event.setMonth(10)
      event.setDate(15)
      event.setHours(14)
      event.setMinutes(30)
     */
    try {
      return await this.prisma.$transaction(async (tx) => {
        // check doctor availabiility for the chosen date
        const doctorAppointment = await this.prisma.doctor.count({
          where: {
            id: doctorId,
            Appointment: {
              some: {
                dateTime: {
                  equals: dateTime,
                },
              },
            },
          },
        });
        if (doctorAppointment.valueOf() > 0) {
          throw new Error('Date booked');
        }

        // if not reserved create a hold on it
        try {
          
        } catch (error) {
          console.error(`Error setting hold on reserved date`)
        }


      });
    } catch (error) {
      console.error('Error booking appointment', error);
    }
  }

  async findAllAppointments() {
    return `This action returns all appointment`;
  }

  async findOneAppointment(id: number) {
    return `This action returns a #${id} appointment`;
  }

  async updateAppointment(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return `This action updates a #${id} appointment`;
  }

  async removeAppointment(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
