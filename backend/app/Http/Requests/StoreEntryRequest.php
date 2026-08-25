<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'      => 'nullable|string|max:255',
            'content'    => 'required|string',
            'mood'       => 'required|in:great,good,okay,low,sad',
            'bg_color'   => 'nullable|string|max:7',
            'entry_date' => 'required|date',
            'photo_path' => 'nullable|string',
            'voice_path' => 'nullable|string',
            'tags'       => 'nullable|array',
            'tags.*'     => 'string|max:50',
        ];
    }
}
