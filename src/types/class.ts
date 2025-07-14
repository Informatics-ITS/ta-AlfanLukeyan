export interface Assignment {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    title: string;
    description: string;
    deadline: string;
    file_name: string;
    file_link: string;
    WeekdID: number;
}

export interface ItemPembelajaran {
    id: number;
    headingPertemuan: string;
    bodyPertemuan: string;
    urlVideo: string;
    fileName: string;
    file_link: string;
}

export interface Week {
    id: number;
    week_number: number;
    class_id: string;
    assignment: Assignment;
    item_pembelajaran: ItemPembelajaran;
}

export interface ClassDetail {
    id_kelas: string;
    name: string;
    tag: string;
    description: string;
    teacher: string;
    teacher_id: string;
    week: Week[];
}

export interface ClassDetailResponse {
    status: string;
    message: string;
    data: ClassDetail;
}

export interface Class {
    id: string;
    name?: string;
    title?: string;
    tag: string;
    description?: string;
    desc?: string;
    teacher?: string;
    teacher_id?: string;
}