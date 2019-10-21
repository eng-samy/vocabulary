<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Vocabulary_Model extends CI_Model {

    public $table = 'vocabulary';

    public function find_all(){
        $this->db->order_by('id','desc');
        return $this->db->get($this->table)->result(); 
    }

    public function find_one($id){
        $this->db->where('id',$id);
        return $this->db->get($this->table)->row_array(); 
    }

    public function add($data){
        if($this->db->insert($this->table,$data)){
            return $this->db->insert_id();
        }else{
            return false;
        }
    }

    public function random_rows(){
        $this->db->select('id,native_word');
        $this->db->from($this->table);
        $this->db->limit(20);
        $this->db->order_by('id','RANDOM');
        return $this->db->get()->result();
    }

}