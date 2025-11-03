import * as pdfkit from 'pdfkit'
import { Injectable } from '@nestjs/common'


@Injectable()
class Invoice{
  constructor (){}

  async createInvoice(){
    const kit = new pdfkit()
  }
}