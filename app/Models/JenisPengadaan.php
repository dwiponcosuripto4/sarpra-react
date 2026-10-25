<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisPengadaan extends Model
{
    use HasFactory;

    protected $table = 'jenis_pengadaan';

    protected $fillable = ['name', 'description'];
}
