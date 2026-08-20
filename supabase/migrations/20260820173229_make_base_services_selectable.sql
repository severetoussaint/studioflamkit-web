update public.pricing_services
set name = case
      when code = 'dialogue_editing_standard' then 'Edición de diálogo'
      when code = 'mastering_standard' then 'Mastering'
      else name
    end,
    included_by_default = false,
    updated_at = now()
where code in ('dialogue_editing_standard', 'mastering_standard');
