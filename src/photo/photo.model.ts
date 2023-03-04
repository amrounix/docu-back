/* eslint-disable prettier/prettier */
import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  underscored: true,
})
export class PhotoModel extends Model<PhotoModel> {
    @Column
    enseigneId: number;

    @Column
    influencerId: number;

    @Column
    fileName: string;

    @Column
    filetype: number;

    @Column
    filepath: string;

    @Column
    order: number;

    @Column
    deleted: number;

}